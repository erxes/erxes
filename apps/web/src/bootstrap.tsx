import 'erxes-ui/fonts.css';
// BlockNote's own styles for erxes-ui's block editor (menus, toolbar).
import '@blocknote/shadcn/style.css';
import './styles.css';
import { StrictMode } from 'react';
import { setFileStorage, setPluginRuntime, setRecordTimeline } from 'erxes-ui';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { i18nReady } from './i18n';
import { orpc } from '@erxes/core-contract/client';
import { coreFileStorage } from './lib/files';
import { pluginLive } from './lib/live';
import { recheckSession } from './lib/queryClient';
import { isSignedOut } from './modules/auth/session';
import { SharedTimeline } from './modules/activity/SharedTimeline';

// erxes-ui's upload hooks (and plugin UIs) store files through core.
setFileStorage(coreFileStorage);

// Plugin UIs show core's timeline for their own records.
setRecordTimeline(SharedTimeline);

// Plugin UIs call their own API with a per-plugin token and hear live signals.
// A plugin page has its own queries, so core refusing its token is passed on
// here: the app shows sign-in rather than the plugin's errors.
setPluginRuntime({
  session: (name) =>
    orpc.plugins.session.call({ name }).catch((error: unknown) => {
      if (isSignedOut(error)) void recheckSession();

      throw error;
    }),
  subscribe: pluginLive,
});

const root = document.getElementById('root');

if (!root) throw new Error('index.html has no #root element');

// A member who reads Mongolian gets it on the first paint, not English and then a swap.
void i18nReady.then(() =>
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);
