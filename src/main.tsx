import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/entry-actions.css';
import './styles/ai-assistant.css';
import './styles/workspace.css';
import './styles/toolbar-refinement.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
);
