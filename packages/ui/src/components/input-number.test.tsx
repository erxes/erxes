// @vitest-environment happy-dom
import { act } from 'react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { setupDomRender } from '../lib/render-in-dom';
import { Input } from './input';

const render = setupDomRender();

/** Renders the input and waits for imask, which loads on first use. */
const renderNumber = async (node: React.ReactNode) => {
  const container = render(node);

  await act(async () => {
    await import('react-imask');
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const input = container.querySelector('input');

  if (!input) throw new Error('no input');

  return input;
};

/** Types `text` as the member would: the browser sets the value, then fires input. */
const type = (input: HTMLInputElement, text: string) => {
  act(() => {
    input.focus();
    input.value = text;
    input.setSelectionRange(text.length, text.length);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const blur = (input: HTMLInputElement) => {
  act(() => {
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  });
};

describe('Input.Number bounds', () => {
  it('refuses a key that would pass max, as 3.x did', async () => {
    const onChange = vi.fn<(value?: number | '') => void>();
    const input = await renderNumber(<Input.Number min={0} max={100} onChange={onChange} />);

    type(input, '50');
    type(input, '500');

    expect(input.value).toBe('50');
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it('refuses the minus sign when min is 0', async () => {
    const onChange = vi.fn<(value?: number | '') => void>();
    const input = await renderNumber(<Input.Number min={0} onChange={onChange} />);

    type(input, '-');

    expect(input.value).toBe('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sets a value under min to min on blur', async () => {
    const onChange = vi.fn<(value?: number | '') => void>();
    const input = await renderNumber(<Input.Number min={10} max={100} onChange={onChange} />);

    type(input, '5');
    blur(input);

    expect(input.value).toBe('10');
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it('takes negatives when no bound is given', async () => {
    const onChange = vi.fn<(value?: number | '') => void>();
    const input = await renderNumber(<Input.Number onChange={onChange} />);

    type(input, '-1234');

    expect(input.value).toBe('-1,234');
    expect(onChange).toHaveBeenLastCalledWith(-1234);
  });
});
