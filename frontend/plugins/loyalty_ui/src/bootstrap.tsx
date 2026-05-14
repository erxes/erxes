import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <div>App</div>
  </StrictMode>,
);
