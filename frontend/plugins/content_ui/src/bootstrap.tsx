import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

const App = () => {
  return <div>App</div>;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
