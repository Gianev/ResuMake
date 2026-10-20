import { useState } from 'react';
import type { ResumeDocument } from '../../models/ResumeDocument';

type Mode = 'improve_selected' | 'star_check' | 'find_metrics' | 'resume_review' | 'general_help';
interface Suggestion { title: string; advice: string; replacement?: string; elementId?: string; }
interface AssistantResponse { summary: string; suggestions: Suggestion[]; questions?: string[]; }
interface Props { document: ResumeDocument; selectedId: string | null; onApply: (id: string, text: string) => void; }

export function AiAssistant(props: Props) {
  if (import.meta.env.VITE_AI_ENABLED !== 'true') {
    return <section className="ai-assistant" aria-labelledby="assistant-heading">
      <div className="ai-heading"><span className="ai-spark" aria-hidden="true">&#x2726;</span><div>
        <h2 id="assistant-heading">Resume assistant</h2>
        <p role="status">AI features are unavailable right now. You can still edit your resume and export it.</p>
      </div></div>
    </section>;
  }
  return <EnabledAiAssistant {...props} />;
}

function EnabledAiAssistant({ document, selectedId, onApply }: Props) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const ask = async (mode: Mode) => {
    setLoading(true); setError('');
    try {
      const apiUrl = import.meta.env.VITE_ASSISTANT_API_URL || (import.meta.env.DEV ? 'http://localhost:8787/api/assistant' : '/api/assistant');
      const result = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, prompt, selectedId, resume: document }) });
      const body = await result.json() as AssistantResponse & { error?: string };
      if (!result.ok) throw new Error(body.error || 'The assistant could not respond.');
      setResponse(body); setPrompt('');
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'The assistant could not respond.'); }
    finally { setLoading(false); }
  };
  return <section className="ai-assistant">
    <div className="ai-heading"><span className="ai-spark" aria-hidden="true">&#x2726;</span><div><h2>Resume assistant</h2><p>Suggestions only—you stay in control.</p></div></div>
    <textarea value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Ask for help with your resume…" aria-label="Ask the resume assistant" />
    <button className="ai-ask" disabled={loading || !prompt.trim()} onClick={() => void ask('general_help')}>{loading ? 'Thinking…' : 'Ask assistant'}</button>
    <div className="ai-shortcuts">
      <button disabled={loading || !selectedId} onClick={() => void ask('improve_selected')}>Improve selected text</button>
      <button disabled={loading || !selectedId} onClick={() => void ask('star_check')}>Check STAR method</button>
      <button disabled={loading || !selectedId} onClick={() => void ask('find_metrics')}>Find metric ideas</button>
      <button disabled={loading} onClick={() => void ask('resume_review')}>Review full resume</button>
    </div>
    {!selectedId && <p className="ai-selection-note">Select a bullet or entry to unlock focused coaching.</p>}
    {error && <p className="ai-error" role="alert">{error}</p>}
    {response && <div className="ai-response"><p className="ai-summary">{response.summary}</p>{response.suggestions?.map((suggestion, index) => <article key={`${suggestion.title}-${index}`}><strong>{suggestion.title}</strong><p>{suggestion.advice}</p>{suggestion.replacement && <><blockquote>{suggestion.replacement}</blockquote><button disabled={!suggestion.elementId && !selectedId} onClick={() => onApply(suggestion.elementId || selectedId!, suggestion.replacement!)}>Apply wording</button></>}</article>)}{response.questions && response.questions.length > 0 && <p className="ai-questions">Consider: {response.questions.join(' · ')}</p>}</div>}
  </section>;
}
