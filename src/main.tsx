import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/error/ErrorBoundary.tsx'

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing root element (#root)');
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
