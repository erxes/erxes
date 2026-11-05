/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ButtonHTMLAttributes } from 'react';
import { ApprovalPrompt } from '../components/ApprovalPrompt';
import type { IAgentToolStep } from '../utils/agentWorkSteps';

jest.mock('erxes-ui', () => ({
  Button: ({
    children,
    variant,
    size,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
  }) => {
    void variant;
    void size;
    return <button {...props}>{children}</button>;
  },
  cn: (...parts: (string | boolean | undefined)[]) =>
    parts.filter(Boolean).join(' '),
}));
jest.mock('../components/BotBadge', () => ({ BotBadge: () => null }));
jest.mock('../components/ChatInput', () => ({ ChatInput: () => null }));

const tool: IAgentToolStep = {
  toolName: 'callGraphql',
  toolCallId: 'remove-customer',
  state: 'approval-requested',
  input: {
    query:
      'mutation AgentsRemove($ids: [String]) { customersRemove(customerIds: $ids) }',
    variables: {
      ids: ['customer-123'],
      changes: { active: false, ownerId: null },
    },
  },
};

it('shows mutation variables, including nested objects, arrays, false and null', () => {
  render(<ApprovalPrompt busy={false} onRespond={jest.fn()} tool={tool} />);
  expect(screen.getByText(/mutation customersRemove/)).toBeTruthy();
  expect(screen.getByText(/customer-123/).textContent).toContain(
    '"active": false',
  );
  expect(screen.getByText(/customer-123/).textContent).toContain(
    '"ownerId": null',
  );
});

it('keeps complete values and all arguments available before approval', () => {
  const content = `${'x'.repeat(1500)}END-OF-CONTENT`;
  const input = Object.fromEntries(
    Array.from({ length: 15 }, (_, index) => [`field${index}`, index]),
  );
  render(
    <ApprovalPrompt
      busy={false}
      onRespond={jest.fn()}
      tool={{
        ...tool,
        toolName: 'businessAction',
        input: { ...input, content },
      }}
    />,
  );
  expect(screen.getByText('field14')).toBeTruthy();
  expect(screen.getByText(/END-OF-CONTENT/).textContent).toBe(content);
});

it('requires explicit approval and disables decisions while submitting', () => {
  const onRespond = jest.fn();
  const view = render(
    <ApprovalPrompt busy={false} onRespond={onRespond} tool={tool} />,
  );
  expect(onRespond).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
  expect(onRespond).toHaveBeenCalledWith({ approved: true });
  view.rerender(<ApprovalPrompt busy onRespond={onRespond} tool={tool} />);
  expect(
    (screen.getByRole('button', { name: 'Approve' }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});
