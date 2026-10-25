/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import {
  useState,
  type ButtonHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import type { UIMessage } from 'ai';
import { UserMessage } from '../components/UserMessage';

jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    Button: React.forwardRef<
      HTMLButtonElement,
      ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: string;
        size?: string;
      }
    >(({ variant: _variant, size: _size, ...props }, ref) => {
      void _variant;
      void _size;
      return <button ref={ref} {...props} />;
    }),
    Textarea: (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
      <textarea {...props} />
    ),
  };
});

const message: UIMessage = {
  id: 'original-turn',
  role: 'user',
  parts: [
    { type: 'text', text: '[Page context] The user is viewing /contacts.' },
    { type: 'text', text: 'Show this month’s deals' },
  ],
};
const mentionMessage: UIMessage = {
  id: 'mention-turn',
  role: 'user',
  parts: [
    { type: 'text', text: 'Email [[customer:c1:Ann Lee]] today' },
    {
      type: 'data-agents-mentions',
      data: { mentions: [{ type: 'customer', id: 'c1', label: 'Ann Lee' }] },
    },
  ],
};
const Harness = ({
  onEdit = jest.fn(),
  disabled = false,
  turn = message,
}: {
  onEdit?: (id: string, text: string) => void;
  disabled?: boolean;
  turn?: UIMessage;
}) => {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <UserMessage
      message={turn}
      editing={editing === turn.id}
      disabled={disabled}
      onEditingChange={setEditing}
      onEdit={onEdit}
    >
      Show this month’s deals
    </UserMessage>
  );
};

it('edits the exact original message without exposing page context', () => {
  const onEdit = jest.fn();
  render(<Harness onEdit={onEdit} />);
  fireEvent.click(screen.getByRole('button', { name: 'Edit message' }));
  const input = screen.getByRole('textbox', {
    name: 'Edit message',
  }) as HTMLTextAreaElement;
  expect(input.value).toBe('Show this month’s deals');
  expect(document.activeElement).toBe(input);
  expect(
    (screen.getByRole('button', { name: 'Save & resend' }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.change(input, { target: { value: '  Show last month’s deals  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save & resend' }));
  expect(onEdit).toHaveBeenCalledWith(
    'original-turn',
    'Show last month’s deals',
  );
  expect(screen.queryByRole('textbox')).toBeNull();
});

it('cancels with Escape and discards the draft', () => {
  const onEdit = jest.fn();
  render(<Harness onEdit={onEdit} />);
  fireEvent.click(screen.getByRole('button', { name: 'Edit message' }));
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Changed' },
  });
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
  expect(onEdit).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Edit message' }));
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe(
    'Show this month’s deals',
  );
});

it('keeps Enter for newlines and supports the explicit keyboard send shortcut', () => {
  const onEdit = jest.fn();
  render(<Harness onEdit={onEdit} />);
  fireEvent.click(screen.getByRole('button', { name: 'Edit message' }));
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'New prompt' },
  });
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
  expect(onEdit).not.toHaveBeenCalled();
  fireEvent.keyDown(screen.getByRole('textbox'), {
    key: 'Enter',
    ctrlKey: true,
  });
  expect(onEdit).toHaveBeenCalledWith(message.id, 'New prompt');
});

it('disables editing during an active run', () => {
  render(<Harness disabled />);
  fireEvent.click(screen.getByRole('button', { name: 'Edit message' }));
  expect(screen.queryByRole('textbox')).toBeNull();
});

it('edits mentions as @labels and resends their tokens', () => {
  const onEdit = jest.fn();
  render(<Harness onEdit={onEdit} turn={mentionMessage} />);
  fireEvent.click(screen.getByRole('button', { name: 'Edit message' }));
  const input = screen.getByRole('textbox') as HTMLTextAreaElement;
  expect(input.value).toBe('Email @Ann Lee today');
  fireEvent.change(input, { target: { value: 'Email @Ann Lee tomorrow' } });
  fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
  expect(onEdit).toHaveBeenCalledWith(
    'mention-turn',
    'Email [[customer:c1:Ann Lee]] tomorrow',
  );
});

it('lets a files-only turn gain a question without copying the placeholder', () => {
  const onEdit = jest.fn();
  const filesOnly: UIMessage = {
    id: 'files-turn',
    role: 'user',
    parts: [
      { type: 'text', text: 'Uploaded files' },
      {
        type: 'data-agents-files',
        data: {
          files: [
            { name: 'a.pdf', url: 'a.pdf', type: 'application/pdf', size: 3 },
          ],
        },
      },
    ],
  };
  const FilesHarness = () => {
    const [editing, setEditing] = useState<string | null>(null);
    return (
      <UserMessage
        message={filesOnly}
        editing={editing === filesOnly.id}
        disabled={false}
        onEditingChange={setEditing}
        onEdit={onEdit}
      >
        attachments
      </UserMessage>
    );
  };
  render(<FilesHarness />);
  expect(screen.queryByRole('button', { name: 'Copy message' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Edit message' }));
  const editor = screen.getByRole('textbox', { name: 'Edit message' });
  expect((editor as HTMLTextAreaElement).value).toBe('');
  fireEvent.change(editor, { target: { value: 'Summarize the PDF' } });
  fireEvent.click(screen.getByRole('button', { name: /Save & resend/ }));
  expect(onEdit).toHaveBeenCalledWith('files-turn', 'Summarize the PDF');
});

it('copies mentions as @labels and resends them with the turn’s files', async () => {
  const writeText = jest.fn(() => Promise.resolve());
  Object.assign(navigator, { clipboard: { writeText } });
  const onEdit = jest.fn();
  render(
    <Harness
      onEdit={onEdit}
      turn={{
        ...mentionMessage,
        parts: [
          ...mentionMessage.parts,
          {
            type: 'data-agents-files',
            data: {
              files: [
                {
                  name: 'a.pdf',
                  url: 'a.pdf',
                  type: 'application/pdf',
                  size: 3,
                },
              ],
            },
          },
        ],
      }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Copy message' }));
  expect(writeText).toHaveBeenCalledWith('Email @Ann Lee today');
  fireEvent.click(screen.getByRole('button', { name: 'Edit message' }));
  const input = screen.getByRole('textbox') as HTMLTextAreaElement;
  expect(input.value).toBe('Email @Ann Lee today');
  fireEvent.change(input, {
    target: { value: 'Email @Ann Lee and summarize' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Save & resend/ }));
  expect(onEdit).toHaveBeenCalledWith(
    'mention-turn',
    'Email [[customer:c1:Ann Lee]] and summarize',
  );
});
