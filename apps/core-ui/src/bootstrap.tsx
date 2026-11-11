import 'erxes-ui/fonts.css';
// BlockNote's own styles for erxes-ui's block editor (menus, toolbar), as old core-ui loaded them.
import '@blocknote/shadcn/style.css';
import './styles.css';
import { StrictMode } from 'react';
import { setFileStorage, setPluginRuntime } from 'erxes-ui';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { api } from './lib/api';
import { coreFileStorage } from './lib/files';
import { pluginLive } from './lib/live';

// erxes-ui's upload hooks (and plugin UIs) store files through core.
setFileStorage(coreFileStorage);
// Plugin UIs call their own API with a per-plugin token and hear live signals.
setPluginRuntime({
  session: (name) => api.plugins.session({ name }),
  subscribe: pluginLive,
});

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
