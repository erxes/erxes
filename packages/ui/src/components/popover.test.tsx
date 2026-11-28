// @vitest-environment happy-dom
import { act, useState } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { actUntil, setupDomRender } from '../lib/render-in-dom';
import { Popover } from './popover';

const render = setupDomRender();

const popup = () => document.querySelector('[data-popup]');

const Picker = ({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) => (
  <Popover onOpenChange={onOpenChange}>
    <Popover.Trigger>Status</Popover.Trigger>
    <Popover.Content data-popup="">
      <button type="button">Done</button>
    </Popover.Content>
  </Popover>
);

/** A popover whose owner holds its open state. */
const Controlled = () => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger>Status</Popover.Trigger>
      <Popover.Content data-popup="">Done</Popover.Content>
    </Popover>
  );
};

/** A button with its own state, to show whether it was mounted again. */
const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <button type="button" data-counter="" onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
};

describe('Popover', () => {
  it('names a closed trigger as a dialog button before it is pressed', () => {
    const trigger = render(<Picker />).querySelector('button');

    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger?.type).toBe('button');
    expect(popup()).toBeNull();
  });

  it('opens on the first press, and its trigger then says so', async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    const container = render(<Picker onOpenChange={onOpenChange} />);

    act(() => container.querySelector('button')?.click());
    await actUntil(() => popup() !== null);

    expect(popup()).not.toBeNull();
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger-press' }),
    );
    expect(container.querySelector('button')?.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes and opens again from its trigger', async () => {
    const container = render(<Picker />);
    const press = () => act(() => container.querySelector('button')?.click());

    press();
    await actUntil(() => popup() !== null);
    press();
    await actUntil(() => popup() === null);
    expect(popup()).toBeNull();

    press();
    await actUntil(() => popup() !== null);
    expect(popup()).not.toBeNull();
  });

  it('stays closed when onOpenChange cancels the press', async () => {
    const container = render(
      <Popover onOpenChange={(_open, details) => details.cancel()}>
        <Popover.Trigger>Status</Popover.Trigger>
        <Popover.Content data-popup="">Done</Popover.Content>
      </Popover>,
    );

    act(() => container.querySelector('button')?.click());
    await act(() => new Promise<void>((resolve) => setTimeout(resolve, 50)));

    expect(popup()).toBeNull();
  });

  it('opens a controlled popover only when its owner passes open', async () => {
    const container = render(<Controlled />);

    act(() => container.querySelector('button')?.click());
    await actUntil(() => popup() !== null);

    expect(popup()).not.toBeNull();
  });

  it('keeps the rest of its children mounted when the trigger is first pressed', async () => {
    const container = render(
      <Popover>
        <Counter />
        <Popover.Trigger data-trigger="">Status</Popover.Trigger>
        <Popover.Content data-popup="">Done</Popover.Content>
      </Popover>,
    );

    const counter = container.querySelector<HTMLButtonElement>('[data-counter]');

    act(() => counter?.click());
    act(() => container.querySelector<HTMLButtonElement>('[data-trigger]')?.click());
    await actUntil(() => popup() !== null);

    expect(container.querySelector('[data-counter]')).toBe(counter);
    expect(counter?.textContent).toBe('1');
  });
});
