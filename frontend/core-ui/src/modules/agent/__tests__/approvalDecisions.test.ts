import type { UIMessage } from 'ai';
import {
  getAgentsApprovalDecision,
  hasAgentsApprovalDecision,
} from '../approvalDecisions';

const message = (parts: UIMessage['parts']): UIMessage => ({
  id: 'reply',
  role: 'assistant',
  parts,
});
const approved: UIMessage['parts'][number] = {
  type: 'tool-callGraphql',
  toolCallId: 'gated',
  state: 'approval-responded',
  input: {},
  approval: { id: 'approval', approved: true },
};
const pending: UIMessage['parts'][number] = {
  type: 'tool-callGraphql',
  toolCallId: 'later',
  state: 'input-available',
  input: {},
};
it('resumes the answered gate while later model calls are still awaiting backend execution', () => {
  expect(getAgentsApprovalDecision([message([approved, pending])])).toEqual({
    toolCallId: 'gated',
    approved: true,
  });
});
it('keeps a declined decision bound to its own call', () => {
  expect(
    getAgentsApprovalDecision([
      message([
        {
          ...approved,
          approval: { id: 'approval', approved: false, reason: 'No' },
        },
        pending,
      ]),
    ]),
  ).toEqual({ toolCallId: 'gated', approved: false, reason: 'No' });
});
it('waits for actual outstanding approval cards, without answering them implicitly', () => {
  expect(
    hasAgentsApprovalDecision({
      messages: [
        message([
          approved,
          { ...pending, state: 'approval-requested', approval: { id: 'next' } },
        ]),
      ],
    }),
  ).toBe(false);
});
it('does not resend an approval from an earlier step or a completed call', () => {
  expect(
    getAgentsApprovalDecision([
      message([approved, { type: 'step-start' }, pending]),
    ]),
  ).toBeUndefined();
  expect(
    getAgentsApprovalDecision([
      message([
        { ...approved, state: 'output-available', output: {} },
        pending,
      ]),
    ]),
  ).toBeUndefined();
  expect(
    getAgentsApprovalDecision([{ id: 'user', role: 'user', parts: [] }]),
  ).toBeUndefined();
});
