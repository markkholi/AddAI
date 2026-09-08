import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ProgressProvider } from './features/progress/ProgressContext';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element missing');
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </BrowserRouter>
  </StrictMode>,
);
