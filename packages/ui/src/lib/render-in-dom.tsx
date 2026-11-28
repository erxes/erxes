import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll } from 'vite-plus/test';

let root: Root | undefined;

/**
 * Lets React render, 25 ms at a time, until `done` holds or 10 s pass: for what a lazy
 * component loads. `act` holds React's work until its callback settles, so each wait is its own.
 */
export const actUntil = async (done: () => boolean, waited = 0): Promise<void> => {
  if (done() || waited >= 10_000) return;

  await act(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 25);
      }),
  );

  return actUntil(done, waited + 25);
};

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
