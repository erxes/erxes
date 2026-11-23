import 'erxes-ui/fonts.css';
import './styles.css';
import { StrictMode } from 'react';
import {
  setConnectionPicker,
  setFileStorage,
  setIntegrationLogo,
  setPluginRuntime,
  setRecordPage,
  setReceiptPrintSettings,
  setRecordTimeline,
  setTransferButtons,
} from 'erxes-ui';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { i18nReady } from './i18n';
import { orpc } from '@erxes/core-contract/client';
import { coreFileStorage } from './lib/files';
import { lazyNamed } from './lib/lazyNamed';
import { pluginLive } from './lib/live';
import { recheckSession } from './lib/queryClient';
import { isSignedOut } from './modules/auth/session';

// erxes-ui's upload hooks (and plugin UIs) store files through core.
setFileStorage(coreFileStorage);

// Plugin UIs show core's timeline for their own records; it loads the first time one shows.
setRecordTimeline(lazyNamed(() => import('./modules/activity/SharedTimeline'), 'SharedTimeline'));

// A plugin record's own page draws like a customer's; it loads the first time a plugin page
// shows it.
setRecordPage(lazyNamed(() => import('./modules/side-panel/RecordPage'), 'RecordPageView'));

setConnectionPicker(
  lazyNamed(() => import('./modules/settings/vault/ConnectionPicker'), 'ConnectionPicker'),
);

// Plugin pages import and export their records through core's transfer; the buttons load the
// first time a plugin page shows one.
setTransferButtons({
  Import: lazyNamed(() => import('./modules/transfer/PluginTransfer'), 'PluginImport'),
  Export: lazyNamed(() => import('./modules/transfer/PluginTransfer'), 'PluginExport'),
});

// A plugin's settings set how its eBarimt receipts print with core's editor, loaded on first use.
setReceiptPrintSettings(
  lazyNamed(() => import('./modules/settings/integrations/EbarimtPrint'), 'PluginReceiptPrint'),
);

// Plugin UIs show a gateway's or integration's logo as Settings › Integrations does.
setIntegrationLogo(
  lazyNamed(
    () => import('./modules/settings/integrations/PluginIntegrationLogo'),
    'PluginIntegrationLogo',
  ),
);

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
