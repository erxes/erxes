import type { Preview } from '@storybook/react';
import '../src/styles.css';
const link = document.createElement('link');
link.href =
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&family=Roboto+Mono:wght@100..700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

document.body.style.fontSize = '14px';

const preview: Preview = {};

export default preview;
