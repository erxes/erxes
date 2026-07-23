import { groupPostCommentThreads } from './postCommentThreads';

describe('groupPostCommentThreads', () => {
  it('groups loaded replies under their parents', () => {
    const parent = { _id: 'parent', parentId: null };
    const reply = { _id: 'reply', parentId: 'parent' };

    expect(groupPostCommentThreads([parent, reply])).toEqual({
      roots: [parent],
      repliesByParent: { parent: [reply] },
    });
  });

  it('keeps replies visible while their parent is on a later cursor page', () => {
    const reply = { _id: 'reply', parentId: 'not-loaded-yet' };
    const nestedReply = { _id: 'nested', parentId: 'reply' };

    expect(groupPostCommentThreads([reply, nestedReply])).toEqual({
      roots: [reply],
      repliesByParent: { reply: [nestedReply] },
    });
  });
});
