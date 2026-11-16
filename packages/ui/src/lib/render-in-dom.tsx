import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll } from 'vite-plus/test';

let root: Root | undefined;

/**
 * Renders a component into the test's document and returns its container; call it in a
 * `.test.tsx` under happy-dom. Each test starts with an empty document.
 */
export const setupDomRender = () => {
  beforeAll(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  });

  afterEach(() => {
    act(() => root?.unmount());
    document.body.innerHTML = '';
  });

  return (node: ReactNode) => {
    const container = document.createElement('div');

    document.body.append(container);
    root = createRoot(container);
    act(() => root?.render(node));

    return container;
  };
};
