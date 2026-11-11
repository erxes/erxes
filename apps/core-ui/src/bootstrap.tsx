import 'erxes-ui/fonts.css';
// BlockNote's own styles for erxes-ui's block editor (menus, toolbar), as old core-ui loaded them.
import '@blocknote/shadcn/style.css';
import './styles.css';
import { StrictMode } from 'react';
import { setFileStorage } from 'erxes-ui';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { coreFileStorage } from './lib/files';

// erxes-ui's upload hooks (and plugin UIs) store files through core.
setFileStorage(coreFileStorage);

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
