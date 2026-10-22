import type { TNotification } from 'ui-modules';
import { TNotificationKind } from 'ui-modules';
import { groupNotificationsByAuthor } from '../groupNotificationsByAuthor';

jest.mock('ui-modules', () => ({ TNotificationKind: { USER: 'user' } }));

const item = (_id: string, author?: string): TNotification => ({
  _id,
  title: _id,
  message: _id,
  createdAt: '2026-10-22T00:00:00Z',
  isRead: false,
  kind: TNotificationKind.USER,
  priority: 'low',
  type: 'info',
  fromUser: author ? { _id: author, isOnboarded: true } : undefined,
});

describe('groupNotificationsByAuthor', () => {
  it('combines the same author, preserving first occurrence and item order', () => {
    const groups = groupNotificationsByAuthor([
      item('first', 'a'),
      item('second', 'b'),
      item('third', 'a'),
    ]);
    expect(groups.map((group) => group.items.map(({ _id }) => _id))).toEqual([
      ['first', 'third'],
      ['second'],
    ]);
  });

  it('does not combine unrelated system notifications or unresolved users', () => {
    expect(
      groupNotificationsByAuthor([item('first'), item('second')]),
    ).toHaveLength(2);
  });

  it('distinguishes authors by id, not by matching display names', () => {
    const first = item('first', 'a');
    const second = item('second', 'b');
    if (first.fromUser && second.fromUser) {
      first.fromUser.details = second.fromUser.details = {
        fullName: 'Same Name',
      };
    }
    expect(groupNotificationsByAuthor([first, second])).toHaveLength(2);
  });
});
