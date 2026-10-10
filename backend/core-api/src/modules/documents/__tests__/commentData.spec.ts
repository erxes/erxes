import { validateDocumentCommentData } from '../commentData';

const timestamp = '2026-10-10T00:00:00.000Z';

function discussion() {
  return {
    threads: [
      {
        type: 'thread',
        id: 'thread',
        createdAt: timestamp,
        updatedAt: timestamp,
        resolved: false,
        comments: [
          {
            type: 'comment',
            id: 'comment',
            userId: 'author',
            createdAt: timestamp,
            updatedAt: timestamp,
            body: [{ type: 'paragraph', content: 'Original comment' }],
            reactions: [
              { emoji: '👍', createdAt: timestamp, userIds: ['author'] },
            ],
          },
        ],
      },
    ],
    anchors: [{ threadId: 'thread', from: 1, to: 2 }],
  };
}

describe('document comment validation', () => {
  const previous = JSON.stringify(discussion());

  it('allows another editor to add and remove their own reaction', () => {
    const next = discussion();
    next.threads[0].comments[0].reactions[0].userIds.push('editor');
    expect(() =>
      validateDocumentCommentData(JSON.stringify(next), 'editor', previous),
    ).not.toThrow();
    expect(() =>
      validateDocumentCommentData(previous, 'editor', JSON.stringify(next)),
    ).not.toThrow();
  });

  it('rejects a forged user hidden in a duplicate emoji entry', () => {
    const next = discussion();
    next.threads[0].comments[0].reactions.push({
      emoji: '👍',
      createdAt: timestamp,
      userIds: ['forged-user'],
    });
    expect(() =>
      validateDocumentCommentData(JSON.stringify(next), 'editor', previous),
    ).toThrow('Invalid document comments');
  });

  it('rejects duplicate reaction users, comment IDs and thread IDs', () => {
    const duplicateUser = discussion();
    duplicateUser.threads[0].comments[0].reactions[0].userIds.push('author');
    const duplicateComment = discussion();
    duplicateComment.threads[0].comments.push(
      duplicateComment.threads[0].comments[0],
    );
    const duplicateThread = discussion();
    duplicateThread.threads.push(duplicateThread.threads[0]);

    for (const next of [duplicateUser, duplicateComment, duplicateThread]) {
      expect(() =>
        validateDocumentCommentData(JSON.stringify(next), 'author', previous),
      ).toThrow('Invalid document comments');
    }
  });

  it('rejects changes to another author, body or reaction', () => {
    const changedAuthor = discussion();
    changedAuthor.threads[0].comments[0].userId = 'editor';
    const changedBody = discussion();
    changedBody.threads[0].comments[0].body[0].content =
      'Edited by someone else';
    const changedReaction = discussion();
    changedReaction.threads[0].comments[0].reactions = [];

    for (const next of [changedAuthor, changedBody, changedReaction]) {
      expect(() =>
        validateDocumentCommentData(JSON.stringify(next), 'editor', previous),
      ).toThrow();
    }
  });

  it('allows the author to edit and a document editor to delete comments', () => {
    const next = discussion();
    next.threads[0].comments[0].body[0].content = 'Edited by the author';
    expect(() =>
      validateDocumentCommentData(JSON.stringify(next), 'author', previous),
    ).not.toThrow();
    expect(() =>
      validateDocumentCommentData(
        '{"threads":[],"anchors":[]}',
        'editor',
        previous,
      ),
    ).not.toThrow();
  });

  it('does not confuse thread and comment IDs containing separators', () => {
    const stored = discussion();
    stored.threads[0].id = 'thread:comment';
    const next = discussion();
    next.threads[0].comments[0].id = 'comment:comment';
    expect(() =>
      validateDocumentCommentData(
        JSON.stringify(next),
        'editor',
        JSON.stringify(stored),
      ),
    ).toThrow('New comments must belong to the acting user');
  });

  it.each(['{', '{"threads":null}', '{"threads":[],"anchors":null}'])(
    'reports malformed stored data without silently discarding it: %s',
    (stored) => {
      expect(() =>
        validateDocumentCommentData(previous, 'author', stored),
      ).toThrow('Stored document comments are invalid');
    },
  );
});
