/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { AgentMentionInput } from '../components/AgentMentionInput';
import type {
  IAgentMentionPopupHandle,
  IAgentMentionPopupProps,
} from '../components/AgentMentionPopup';
import { useAgentMentions } from '../hooks/useAgentMentions';

jest.mock('../components/AgentMentionPopup', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const mockAnn = { type: 'customer', id: 'c1', label: 'Ann Lee' } as const;
  return {
    AgentMentionPopup: React.forwardRef<
      IAgentMentionPopupHandle,
      IAgentMentionPopupProps
    >(({ query, onPick, onDismiss }, ref) => {
      React.useImperativeHandle(ref, () => ({
        handleKeyDown: (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onPick(mockAnn);
            return true;
          }
          if (event.key === 'Escape') {
            onDismiss();
            return true;
          }
          return false;
        },
      }));
      return <div role="listbox">{`menu:${query.query}`}</div>;
    }),
  };
});

let serialized = '';
const Harness = ({ onKeyDown }: { onKeyDown?: () => void }) => {
  const [text, setText] = useState('');
  const mentions = useAgentMentions(text);
  serialized = mentions.serialize(text);
  return (
    <AgentMentionInput
      mentions={mentions}
      value={text}
      onChange={setText}
      onKeyDown={onKeyDown}
      ariaLabel="Message"
    />
  );
};

const input = () =>
  screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement;
const type = (value: string) => {
  fireEvent.change(input(), { target: { value } });
  fireEvent.select(input());
};

beforeEach(() => {
  serialized = '';
});

it('opens the menu for an @ query and inserts the picked record as a mention', async () => {
  const onKeyDown = jest.fn();
  render(<Harness onKeyDown={onKeyDown} />);
  act(() => input().focus());
  type('Email @an');
  expect((await screen.findByRole('listbox')).textContent).toBe('menu:an');
  fireEvent.keyDown(input(), { key: 'Enter' });
  expect(onKeyDown).not.toHaveBeenCalled();
  expect(input().value).toBe('Email @Ann Lee ');
  expect(serialized).toBe('Email [[customer:c1:Ann Lee]] ');
  expect(screen.queryByRole('listbox')).toBeNull();
  expect(input().getAttribute('aria-autocomplete')).toBe('list');
});

it('paints each mention as a pill behind the textarea', async () => {
  const { container } = render(<Harness />);
  act(() => input().focus());
  type('@an');
  await screen.findByRole('listbox');
  fireEvent.keyDown(input(), { key: 'Enter' });
  const pill = container.querySelector('[aria-hidden] .rounded-full');
  expect(pill?.textContent).toBe('@Ann Lee');
});

it('removes a mention as one unit and forgets it after a reset', async () => {
  render(<Harness />);
  act(() => input().focus());
  type('Hi @an');
  await screen.findByRole('listbox');
  fireEvent.keyDown(input(), { key: 'Enter' });
  input().setSelectionRange(11, 11);
  fireEvent.keyDown(input(), { key: 'Backspace' });
  expect(input().value).toBe('Hi  ');
  expect(serialized).toBe('Hi  ');
  type('Hi @Ann Lee');
  expect(serialized).toBe('Hi @Ann Lee');
});

it('turns a mention edited from the inside back into plain text', async () => {
  render(<Harness />);
  act(() => input().focus());
  type('@an');
  await screen.findByRole('listbox');
  fireEvent.keyDown(input(), { key: 'Enter' });
  expect(serialized).toBe('[[customer:c1:Ann Lee]] ');
  type('@Ann Le ');
  expect(serialized).toBe('@Ann Le ');
});

it('dismisses with Escape until the trigger changes, then forwards keys', async () => {
  const onKeyDown = jest.fn();
  render(<Harness onKeyDown={onKeyDown} />);
  act(() => input().focus());
  type('@an');
  await screen.findByRole('listbox');
  fireEvent.keyDown(input(), { key: 'Escape' });
  expect(screen.queryByRole('listbox')).toBeNull();
  type('@ann');
  expect(screen.queryByRole('listbox')).toBeNull();
  fireEvent.keyDown(input(), { key: 'Enter' });
  expect(onKeyDown).toHaveBeenCalledTimes(1);
  type('@ann @b');
  expect((await screen.findByRole('listbox')).textContent).toBe('menu:b');
});

it('closes when the textarea loses focus', async () => {
  render(<Harness />);
  act(() => input().focus());
  type('@an');
  await screen.findByRole('listbox');
  act(() => input().blur());
  expect(screen.queryByRole('listbox')).toBeNull();
});
