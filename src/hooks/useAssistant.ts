import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { skills } from '../data/static';

export type AssistantMode = 'idle' | 'speaking' | 'waving' | 'listening';

interface SpeechRecognitionEventLike {
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type RecognitionConstructor = new () => SpeechRecognitionLike;

const preferredVoices = [
  'zira', 'jenny', 'aria', 'samantha', 'female', 'karen', 'moira', 'google us english',
];

export function useAssistant() {
  const { projects, certificates, services, config } = useData();
  const [mode, setMode] = useState<AssistantMode>('idle');
  const [muted, setMuted] = useState(false);
  const [answer, setAnswer] = useState(
    "Hi! I'm Amna Sahar's virtual assistant. Press “Talk to My AI Assistant” for a guided introduction, or ask me a question below.",
  );
  const [question, setQuestion] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const generationRef = useRef(0);
  const queueRef = useRef<string[]>([]);
  const lastSpokenRef = useRef('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const unlockedRef = useRef(false);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }
    const load = () => {
      const loaded = window.speechSynthesis.getVoices();
      voicesRef.current = loaded;
      setVoices(loaded);
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Mobile browsers (iOS Safari / Android Chrome) unlock speech and audio only
  // while a tap/click handler is running. This must be called synchronously
  // from the first user interaction, before any delayed speech starts.
  const unlockMobileAudio = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    try {
      if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const primer = new SpeechSynthesisUtterance(' ');
        primer.volume = 0;
        primer.rate = 10;
        synth.speak(primer);
        const loaded = synth.getVoices();
        if (loaded.length) {
          voicesRef.current = loaded;
          setVoices(loaded);
        }
      }
    } catch {
      // Ignore browsers that reject silently-initialised speech.
    }
    try {
      // Also unlock <audio> playback for the optional ElevenLabs voice path.
      const silent = new Audio(
        'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      );
      silent.volume = 0;
      void silent.play().catch(() => undefined);
    } catch {
      // Ignore unlock failures; the browser still shows text captions.
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pickVoice = useCallback(() => {
    // Mobile browsers often populate voices asynchronously; read the live list
    // first so a late `voiceschanged` does not leave us with no voice.
    const live = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
    const available = live.length ? live : voicesRef.current.length ? voicesRef.current : voices;
    const english = available.filter((voice) => voice.lang.toLowerCase().startsWith('en'));
    const pool = english.length ? english : available;
    for (const name of preferredVoices) {
      const found = pool.find((voice) => voice.name.toLowerCase().includes(name));
      if (found) return found;
    }
    return pool[0] || null;
  }, [voices]);

  // Cancels current audio without clearing the guided-tour queue.
  const cancelOutput = useCallback(() => {
    generationRef.current += 1;
    clearTimer();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [clearTimer]);

  const stop = useCallback(() => {
    cancelOutput();
    queueRef.current = [];
    setMode('idle');
  }, [cancelOutput]);

  const speak = useCallback((input: string, onDone?: () => void) => {
    if (!input.trim()) {
      onDone?.();
      return;
    }
    cancelOutput();
    // Must run inside the tap/click that started this speech.
    unlockMobileAudio();
    const generation = generationRef.current;
    lastSpokenRef.current = input;
    setAnswer(input);
    setMode('speaking');

    const finish = () => {
      if (generationRef.current !== generation) return;
      setMode('idle');
      onDone?.();
    };

    if (muted) {
      const duration = Math.min(9000, Math.max(1600, input.split(/\s+/).length * 95));
      timerRef.current = window.setTimeout(finish, duration);
      return;
    }

    const speakWithBrowser = () => {
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
        setSupported(false);
        finish();
        return;
      }
      try {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(input);
        const voice = pickVoice();
        if (voice) utterance.voice = voice;
        utterance.rate = 0.98;
        utterance.pitch = 1.06;
        utterance.volume = 1;
        utterance.onend = finish;
        utterance.onerror = finish;
        // Cancel the silent primer (if any) and resume the engine before
        // speaking. This is required on iOS Safari after a background/tab switch.
        synth.cancel();
        synth.resume();
        synth.speak(utterance);
      } catch {
        // The visible caption in AssistantPanel is the safe text fallback.
        setSupported(false);
        finish();
      }
    };

    if (config.voiceProvider === 'elevenlabs') {
      fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      })
        .then((response) => {
          if (!response.ok) throw new Error('Voice service unavailable');
          return response.blob();
        })
        .then((blob) => {
          if (generationRef.current !== generation) return;
          const objectUrl = URL.createObjectURL(blob);
          const audio = new Audio(objectUrl);
          audioRef.current = audio;
          audio.onended = () => {
            URL.revokeObjectURL(objectUrl);
            finish();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            speakWithBrowser();
          };
          audio.play().catch(speakWithBrowser);
        })
        .catch(speakWithBrowser);
      return;
    }

    speakWithBrowser();
  }, [cancelOutput, config.voiceProvider, muted, pickVoice, unlockMobileAudio]);

  const speakQueue = useCallback((lines: string[]) => {
    stop();
    const active = lines.filter(Boolean);
    queueRef.current = active.slice(1);
    const next = () => {
      const upcoming = queueRef.current.shift();
      if (upcoming) speak(upcoming, next);
    };
    speak(active[0] || '', next);
  }, [speak, stop]);

  const greeting = useCallback(() => {
    stop();
    // Unlock mobile speech while this tap is still active; the spoken tour
    // starts after the short wave animation.
    unlockMobileAudio();
    setMode('waving');
    clearTimer();
    const skillNames = skills.slice(0, 6).map((item) => item.title);
    const projectNames = projects.slice(0, 5).map((item) => item.title);
    const certificateNames = certificates.map((item) => item.title);
    const serviceNames = services.slice(0, 5).map((item) => item.title);
    const email = config.contactEmail || config.settings.contactEmail;

    const lines = [
      "Hello! I'm the virtual assistant of Amna Sahar. It's lovely to meet you.",
      'Amna is an AI Developer and Creative Web Developer. She also works in graphic design, web design, AI tools and digital creativity.',
      `Her skills include ${skillNames.join(', ')}, along with prompt engineering, branding and responsive design.`,
      projectNames.length
        ? `Projects you can explore here include ${projectNames.join(', ')}.`
        : 'New projects can be added by Amna in Admin Mode.',
      certificateNames.length
        ? `Her certificates include ${certificateNames.join(' and ')}.`
        : 'Certificate details can be managed by Amna in Admin Mode.',
      serviceNames.length
        ? `Her services include ${serviceNames.join(', ')}.`
        : 'Service details can be managed by Amna in Admin Mode.',
      email
        ? `To contact or hire Amna, use the contact form on this site or email ${email}.`
        : 'To contact or hire Amna, please use the contact form on this site.',
      'Thank you for visiting. Type a question any time and I will do my best to help.',
    ];
    timerRef.current = window.setTimeout(() => speakQueue(lines), 1250);
  }, [certificates, clearTimer, config.contactEmail, config.settings.contactEmail, projects, services, speakQueue, stop, unlockMobileAudio]);

  const buildAnswer = useCallback((raw: string) => {
    const value = raw.toLowerCase();
    const has = (...words: string[]) => words.some((word) => value.includes(word));
    const email = config.contactEmail || config.settings.contactEmail;
    const contactLine = email
      ? `You can use the contact form on this site, or email ${email}.`
      : 'You can use the contact form on this site.';
    const projectNames = projects.map((item) => item.title);
    const certificateNames = certificates.map((item) => item.title);
    const serviceNames = services.map((item) => item.title);

    if (has('who are you', 'your name', 'what are you')) {
      return "I'm the virtual assistant of Amna Sahar, here to introduce her portfolio and answer your questions.";
    }
    if (has('contact', 'email', 'reach', 'hire', 'quote')) {
      return `Amna welcomes project enquiries and collaborations. ${contactLine} Add your name, email, subject and message and it will be saved for her.`;
    }
    if (has('certificate', 'course', 'academy', 'giaic', 'nyrvex', 'panaversity')) {
      return certificateNames.length
        ? `The certificates listed are ${certificateNames.join(' and ')}. You can see their details in the Certificates section.`
        : 'Certificate details can be added by Amna in Admin Mode.';
    }
    if (has('project', 'portfolio', 'work you', 'built')) {
      return projectNames.length
        ? `Featured projects include ${projectNames.slice(0, 8).join(', ')}. Open the Projects section to filter them and view details.`
        : 'Projects can be added by Amna in Admin Mode.';
    }
    if (has('service', 'offer', 'do for', 'design', 'development')) {
      return serviceNames.length
        ? `Amna offers ${serviceNames.join(', ')}. Each service card has a button that takes you to the contact form.`
        : 'Services can be managed by Amna in Admin Mode.';
    }
    if (has('skill', 'good at', 'capab', 'tools', 'ai')) {
      return `Amna's skills include ${skills.map((item) => item.title).join(', ')}.`;
    }
    if (has('price', 'cost', 'rate', 'budget')) {
      return `Pricing depends on the project. ${contactLine} and describe what you need for a quote.`;
    }
    if (has('amna', 'about', 'who is')) {
      return 'Amna Sahar is an AI Developer and Creative Web Developer with an interest in graphic design, website creation, AI tools and digital creativity. Her goal is to create beautiful and useful digital experiences.';
    }
    return 'I can tell you about Amna’s skills, projects, certificates, services, and how to contact her. What would you like to know?';
  }, [certificates, config.contactEmail, config.settings.contactEmail, projects, services]);

  const ask = useCallback((raw: string) => {
    const clean = raw.trim();
    if (!clean) return;
    setQuestion(clean);
    speak(buildAnswer(clean));
  }, [buildAnswer, speak]);

  const startListening = useCallback(() => {
    const Recognition = (window as unknown as {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    }).SpeechRecognition || (window as unknown as {
      webkitSpeechRecognition?: RecognitionConstructor;
    }).webkitSpeechRecognition;

    if (!Recognition) {
      setAnswer('Voice input is not supported in this browser. Type your question instead — I can still answer out loud.');
      return;
    }
    stop();
    // Unlock output now so the answer triggered by the recognition callback
    // can still speak on mobile.
    unlockMobileAudio();
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) ask(transcript);
    };
    recognition.onerror = () => {
      setMode('idle');
      setAnswer('I could not hear that clearly. Please try again or type your question.');
    };
    recognition.onend = () => setMode((current) => (current === 'listening' ? 'idle' : current));
    recognitionRef.current = recognition;
    setMode('listening');
    recognition.start();
  }, [ask, stop, unlockMobileAudio]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const replay = useCallback(() => {
    const text = lastSpokenRef.current;
    if (text) speak(text);
    else greeting();
  }, [greeting, speak]);

  return useMemo(() => ({
    mode, muted, answer, question, supported,
    setQuestion,
    setMuted,
    speak,
    speakQueue,
    greeting,
    ask,
    stop,
    replay,
    startListening,
  }), [mode, muted, answer, question, supported, speak, speakQueue, greeting, ask, stop, replay, startListening]);
}
