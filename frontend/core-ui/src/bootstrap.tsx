import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import { init } from '@module-federation/enhanced/runtime';

import { NODE_ENV, REACT_APP_API_URL } from 'erxes-ui';

import '@blocknote/shadcn/style.css';
import './styles.css';

import { App } from '@/app/components/App';
import { ClientConfigError } from '@/error-handler/components/ClientConfigError';
import { initSentry } from './sentry';

// Install browser error handlers as early as possible, before any rendering.
initSentry();

// Reload once when a deployed chunk becomes stale (e.g. a new release
// invalidated the hashed filename the current bundle references). This prevents
// a broken UI and avoids spamming Sentry with deployment artifacts.
window.addEventListener('error', (event) => {
  if (event.error?.name !== 'ChunkLoadError') {
    return;
  }

  try {
    const reloadKey = 'erxes_chunk_reload_count';
    const count = Number(sessionStorage.getItem(reloadKey) || '0');

    if (count < 1) {
      sessionStorage.setItem(reloadKey, String(count + 1));
      window.location.reload();
    } else {
      sessionStorage.removeItem(reloadKey);
    }
  } catch {
    // If storage is unavailable, still attempt to recover.
    window.location.reload();
  }
});

async function initFederation() {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
  );

  if (NODE_ENV === 'development') {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } else {
    fetch(`${REACT_APP_API_URL}/get-frontend-plugins`)
      .then((res) => res.json())
      .then((data) => {
        init({
          name: 'core',
          remotes: data,
        });

        root.render(<App />);
      })
      .catch((error: unknown) => {
        console.error(
          'Failed to initialize frontend plugins:',
          error instanceof Error ? error.message : String(error),
        );

        root.render(
          <ClientConfigError
            error={
              error instanceof Error
                ? error
                : new Error('Failed to initialize frontend plugins')
            }
          />,
        );
      });
  }
}

initFederation().catch((err) => {
  console.error('Failed to initialize module federation:', err);
});
