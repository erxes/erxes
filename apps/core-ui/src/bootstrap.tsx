import 'erxes-ui/fonts.css';
// BlockNote's own styles for erxes-ui's block editor (menus, toolbar), as old core-ui loaded them.
import '@blocknote/shadcn/style.css';
import './styles.css';
import { StrictMode } from 'react';
import { setFileStorage, setPluginRuntime, setRecordTimeline } from 'erxes-ui';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { orpc } from './lib/api';
import { coreFileStorage } from './lib/files';
import { pluginLive } from './lib/live';
import { SharedTimeline } from './modules/activity/SharedTimeline';

// erxes-ui's upload hooks (and plugin UIs) store files through core.
setFileStorage(coreFileStorage);

// Plugin UIs show core's timeline for their own records.
setRecordTimeline(SharedTimeline);

// Plugin UIs call their own API with a per-plugin token and hear live signals.
setPluginRuntime({
  session: (name) => orpc.plugins.session.call({ name }),
  subscribe: pluginLive,
});

const root = document.getElementById('root');

if (!root) throw new Error('index.html has no #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
