import App from './App';
import { createRoot } from 'react-dom/client';
import React from 'react';

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />);
