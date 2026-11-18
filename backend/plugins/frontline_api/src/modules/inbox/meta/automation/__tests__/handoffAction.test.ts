import type {
  IAutomationAction,
  IAutomationExecution,
} from 'erxes-api-shared/core-modules';
import type { IModels } from '~/connectionResolvers';
import {
  getAutomatedReplyPauseEnd,
  isAutomatedReplyPaused,
} from '@/inbox/services/automatedReplyPause';
import {
  executeHandoffAction,
  readHandoffPauseMinutes,
} from '../handoffAction';

jest.mock('@/ticket/utils/conversationTickets', () => ({
  resolveInboxConversationId: jest.fn(async (_models, id) =>
    id === 'fb-conversation' ? 'inbox-1' : undefined,
  ),
}));

jest.mock('erxes-api-shared/core-modules', () => ({
  buildSkippedAction: (reason: string) => ({ skipped: true, reason }),
  replaceOutputPlaceholders: jest.fn(async ({ values }) => values),
}));

const NOW = new Date('2026-11-09T10:00:00.000Z');

const makeModels = () =>
  ({
    Conversations: {
      setAutomatedReplyControl: jest.fn(),
      assignUserConversation: jest.fn(),
    },
  }) as unknown as IModels;

describe('getAutomatedReplyPauseEnd', () => {
  it('is empty when the bot is active or never paused', () => {
    expect(getAutomatedReplyPauseEnd(undefined)).toBeUndefined();
    expect(getAutomatedReplyPauseEnd({ status: 'active' })).toBeUndefined();
  });

  it('ends at pausedUntil, else 30 minutes after the last change', () => {
    expect(
      getAutomatedReplyPauseEnd({
        status: 'handoff_requested',
        pausedUntil: new Date('2026-11-09T11:00:00.000Z'),
      }),
    ).toEqual(new Date('2026-11-09T11:00:00.000Z'));

    expect(
      getAutomatedReplyPauseEnd({
        status: 'human_active',
        updatedAt: new Date('2026-11-09T10:00:00.000Z'),
      }),
    ).toEqual(new Date('2026-11-09T10:30:00.000Z'));
  });
});

describe('isAutomatedReplyPaused', () => {
  it('holds the bot back while the pause runs', async () => {
    const models = makeModels();

    await expect(
      isAutomatedReplyPaused(
        models,
        {
          _id: 'inbox-1',
          automatedReplyControl: {
            status: 'handoff_requested',
            pausedUntil: new Date('2026-11-09T10:20:00.000Z'),
          },
        },
        NOW,
      ),
    ).resolves.toBe(true);
    expect(models.Conversations.setAutomatedReplyControl).not.toHaveBeenCalled();
  });

  it('closes a pause that ran out and lets the bot answer', async () => {
    const models = makeModels();

    await expect(
      isAutomatedReplyPaused(
        models,
        {
          _id: 'inbox-1',
          automatedReplyControl: {
            status: 'human_active',
            updatedAt: new Date('2026-11-09T09:00:00.000Z'),
          },
        },
        NOW,
      ),
    ).resolves.toBe(false);
    expect(models.Conversations.setAutomatedReplyControl).toHaveBeenCalledWith(
      'inbox-1',
      { status: 'active', reason: 'timeout_expired' },
    );
  });
});

describe('readHandoffPauseMinutes', () => {
  it('defaults to 30, rounds, and caps at a week', () => {
    expect(readHandoffPauseMinutes(undefined)).toBe(30);
    expect(readHandoffPauseMinutes('')).toBe(30);
    expect(readHandoffPauseMinutes('-5')).toBe(30);
    expect(readHandoffPauseMinutes('45.4')).toBe(45);
    expect(readHandoffPauseMinutes(100000)).toBe(7 * 24 * 60);
  });
});

describe('executeHandoffAction', () => {
  it('pauses the inbox conversation behind a Facebook message and assigns', async () => {
    const models = makeModels();

    const response = await executeHandoffAction({
      models,
      subdomain: 'test',
      action: {
        id: 'a1',
        type: 'frontline:inbox.handoffs.create',
        config: { assignTo: 'u1, u2', pauseMinutes: 60 },
      } as unknown as IAutomationAction,
      execution: { target: { conversationId: 'fb-conversation' } } as unknown as IAutomationExecution,
      now: NOW,
    });

    expect(models.Conversations.setAutomatedReplyControl).toHaveBeenCalledWith(
      'inbox-1',
      {
        status: 'handoff_requested',
        reason: 'automation',
        pausedUntil: new Date('2026-11-09T11:00:00.000Z'),
      },
    );
    expect(models.Conversations.assignUserConversation).toHaveBeenCalledWith(
      ['inbox-1'],
      'u1',
      ['u1', 'u2'],
    );
    expect(response).toEqual({
      result: {
        conversationId: 'inbox-1',
        status: 'handoff_requested',
        pausedUntil: '2026-11-09T11:00:00.000Z',
        assignedUserIds: ['u1', 'u2'],
      },
    });
  });

  it('skips a run that has no conversation', async () => {
    const models = makeModels();

    await expect(
      executeHandoffAction({
        models,
        subdomain: 'test',
        action: { id: 'a1', type: 'frontline:inbox.handoffs.create', config: {} } as unknown as IAutomationAction,
        execution: { target: { _id: 'customer-1' } } as unknown as IAutomationExecution,
        now: NOW,
      }),
    ).resolves.toEqual({ skipped: true, reason: 'no-conversation' });
    expect(models.Conversations.setAutomatedReplyControl).not.toHaveBeenCalled();
  });
});
