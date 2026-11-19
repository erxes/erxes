// @vitest-environment happy-dom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { PluginError } from '../PluginBoundary';

let root: Root | undefined;
const reload = vi.fn<() => void>();
const retry = vi.fn<() => void>();

const HOUR = 3_600_000;
const MINUTE = 60_000;

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.spyOn(window.location, 'reload').mockImplementation(reload);
  vi.useFakeTimers({ toFake: ['Date'] });
});

afterAll(() => {
  vi.useRealTimers();
});

afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
  reload.mockClear();
  retry.mockClear();
});

/** Each test starts an hour after the last one, so the tab's last reload never holds it back. */
let clock = Date.UTC(2026, 10, 20);

const newHour = () => {
  clock += HOUR;
  vi.setSystemTime(clock);
};

/** What the browser throws when a tab opened before an update asks for a file the update removed. */
const staleChunk = (
  message = 'Loading chunk d failed.\n(error: https://x.test/d.c9628609dd.js)',
) => {
  const error = new Error(message);

  error.name = 'ChunkLoadError';

  return error;
};

/** A frontline page or section that failed with `error`, as PluginPage and PluginBoundary show it. */
const renderFailure = (error: Error) => {
  act(() => root?.unmount());

  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  act(() =>
    root?.render(
      createElement(PluginError, {
        name: 'frontline',
        title: 'frontline stopped working',
        error,
        onRetry: retry,
      }),
    ),
  );

  return container;
};

const button = (page: HTMLElement) => page.querySelector('button');

describe('a plugin part that fails', () => {
  it('reloads the tab once when the plugin was updated since it opened', () => {
    newHour();
    const page = renderFailure(staleChunk());

    expect(page.textContent).toContain('frontline was updated');
    expect(button(page)?.textContent).toBe('Reload');
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload again within a minute, so a missing file cannot loop', () => {
    newHour();
    renderFailure(staleChunk());
    vi.setSystemTime(clock + MINUTE - 1);
    const page = renderFailure(staleChunk());

    expect(page.textContent).toContain('frontline was updated');
    expect(reload).toHaveBeenCalledTimes(1);

    act(() => button(page)?.click());
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('reloads again for an update a minute or more later', () => {
    newHour();
    renderFailure(staleChunk());
    vi.setSystemTime(clock + MINUTE);
    renderFailure(staleChunk());

    expect(reload).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['its name', staleChunk('Script error.')],
    [
      'its message, as a style file',
      new Error('Loading CSS chunk 7 failed.\n(https://x.test/7.css)'),
    ],
    ['its cause', new Error('remote failed', { cause: staleChunk() })],
  ])('knows a removed file by %s', (_, error) => {
    newHour();
    const page = renderFailure(error);

    expect(page.textContent).toContain('frontline was updated');
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('offers a retry for any other error, without reloading', () => {
    newHour();
    const page = renderFailure(new Error('Cannot read properties of undefined'));

    expect(page.textContent).toContain('frontline stopped working');
    expect(page.textContent).toContain('Cannot read properties of undefined');

    act(() => button(page)?.click());
    expect(retry).toHaveBeenCalledTimes(1);
    expect(reload).not.toHaveBeenCalled();
  });
});
