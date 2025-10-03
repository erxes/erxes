import * as ReactDOM from 'react-dom/client';

import { StrictMode } from 'react';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <div>App</div>
  </StrictMode>,
);
