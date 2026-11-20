import type { FormEvent } from 'react';
import {
  AudioLines, Mic, PauseCircle, PlayCircle, RotateCcw, Send, Volume2, VolumeX,
} from 'lucide-react';
import type { useAssistant } from '../hooks/useAssistant';

type Assistant = ReturnType<typeof useAssistant>;

const modeLabel: Record<Assistant['mode'], string> = {
  idle: 'Ready',
  speaking: 'Speaking',
  waving: 'Waving hello',
  listening: 'Listening',
};

export default function AssistantPanel({ assistant, provider }: { assistant: Assistant; provider: string }) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    assistant.ask(assistant.question);
  };

  return (
    <div className="assistant-panel glass-card">
      <div className="assistant-panel__top">
        <div className="assistant-panel__identity">
          <span className={`status-dot status-dot--${assistant.mode}`} />
          <div>
            <strong>Lavender · AI Assistant</strong>
            <small>{modeLabel[assistant.mode]} · {provider === 'elevenlabs' ? 'Neural voice enabled' : 'Browser voice'}</small>
          </div>
        </div>
        <button type="button" className="icon-button" onClick={() => assistant.setMuted(!assistant.muted)} aria-label={assistant.muted ? 'Unmute voice' : 'Mute voice'} title={assistant.muted ? 'Unmute voice' : 'Mute voice'}>
          {assistant.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      <button type="button" className="btn btn--primary assistant-panel__talk" onClick={assistant.greeting}>
        <AudioLines size={18} /> Talk to My AI Assistant
      </button>

      <p className="assistant-panel__answer" aria-live="polite">{assistant.answer}</p>

      <form className="assistant-panel__form" onSubmit={submit}>
        <input
          type="text"
          value={assistant.question}
          onChange={(event) => assistant.setQuestion(event.target.value)}
          placeholder="Ask about skills, projects, certificates…"
          aria-label="Question for the AI assistant"
          maxLength={200}
        />
        <button type="submit" className="icon-button icon-button--accent" aria-label="Send question" title="Send question">
          <Send size={17} />
        </button>
        <button type="button" className="icon-button" onClick={assistant.startListening} aria-label="Ask with your voice" title="Ask with your voice">
          <Mic size={17} />
        </button>
      </form>

      <div className="assistant-panel__controls">
        <button type="button" onClick={() => assistant.speak(assistant.answer)}><PlayCircle size={16} /> Start Speaking</button>
        <button type="button" onClick={assistant.stop}><PauseCircle size={16} /> Stop Speaking</button>
        <button type="button" onClick={assistant.replay}><RotateCcw size={16} /> Replay Voice</button>
      </div>
      {!assistant.supported && (
        <p className="assistant-panel__note">Speech output is unavailable in this browser; answers are still shown as text.</p>
      )}
    </div>
  );
}
