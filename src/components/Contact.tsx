import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Github, Instagram, Linkedin, Mail, MessageCircle, Send } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { api } from '../api';
import { useData } from '../context/DataContext';

const initial = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const { config } = useData();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const update = (key: keyof typeof initial, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
    setStatus('idle');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Please enter a valid email address.';
    if (form.subject.trim().length < 2) next.subject = 'Please add a subject.';
    if (form.message.trim().length < 10) next.message = 'Please write at least 10 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus('sending');
    try {
      await api.contact(form);
      setStatus('success');
      setFeedback('Your message has been submitted and saved successfully. Thank you for reaching out!');
      setForm(initial);
    } catch (cause) {
      setStatus('error');
      setFeedback(cause instanceof Error ? cause.message : 'The message could not be sent. Please try again.');
    }
  };

  const socials = [
    { key: 'github' as const, label: 'GitHub', icon: Github },
    { key: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin },
    { key: 'instagram' as const, label: 'Instagram', icon: Instagram },
    { key: 'twitter' as const, label: 'X / Twitter', icon: MessageCircle },
  ].filter((item) => config.settings[item.key]);

  return (
    <section id="contact" className="section section--tinted">
      <div className="container">
        <SectionHeading eyebrow="LET'S CONNECT" title="Contact Me" description="Have a project, an idea or a question? I'd love to hear about it." />
        <div className="contact__grid">
          <div className="contact__details glass-card">
            <h3>Start a conversation</h3>
            <p>
              Tell me a little about your project — what you're building, who it's for and the
              feeling you want it to create. I'll get back to you as soon as I can.
            </p>
            {config.contactEmail ? (
              <a className="contact__email" href={`mailto:${config.contactEmail}`}>
                <Mail size={18} /> {config.contactEmail} <ArrowRight size={16} />
              </a>
            ) : (
              <p className="contact__note">An email address can be added by Amna in Admin Mode → Settings.</p>
            )}
            <div className="contact__divider" />
            <p className="contact__social-label">Find me online</p>
            <div className="contact__socials">
              {socials.length ? socials.map(({ key, label, icon: Icon }) => (
                <a key={key} href={config.settings[key]} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                  <Icon size={19} />
                </a>
              )) : <span className="muted">Social links can be added in Admin Mode.</span>}
            </div>
          </div>

          <form className="contact-form glass-card" onSubmit={submit} noValidate>
            <div className="form-row">
              <label>
                <span>Full name</span>
                <input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Your full name" maxLength={100} />
                {errors.name && <small className="field-error">{errors.name}</small>}
              </label>
              <label>
                <span>Email address</span>
                <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" maxLength={160} />
                {errors.email && <small className="field-error">{errors.email}</small>}
              </label>
            </div>
            <label>
              <span>Subject</span>
              <input value={form.subject} onChange={(event) => update('subject', event.target.value)} placeholder="What would you like to discuss?" maxLength={150} />
              {errors.subject && <small className="field-error">{errors.subject}</small>}
            </label>
            <label>
              <span>Message</span>
              <textarea value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="Tell me about your project…" rows={5} maxLength={3000} />
              {errors.message && <small className="field-error">{errors.message}</small>}
            </label>
            <button className="btn btn--primary contact-form__submit" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : <>Send Message <Send size={17} /></>}
            </button>
            {feedback && (
              <div className={`form-feedback ${status === 'error' ? 'form-feedback--error' : ''}`} role="status">
                {status === 'success' && <CheckCircle2 size={18} />} {feedback}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
