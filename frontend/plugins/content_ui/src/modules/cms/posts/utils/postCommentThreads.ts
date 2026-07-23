interface ThreadComment {
  _id: string;
  parentId?: string | null;
}

export interface CommentThreads<TComment extends ThreadComment> {
  roots: TComment[];
  repliesByParent: Record<string, TComment[]>;
}

export const groupPostCommentThreads = <TComment extends ThreadComment>(
  comments: TComment[],
): CommentThreads<TComment> => {
  const loadedCommentIds = new Set(comments.map((comment) => comment._id));
  const roots: TComment[] = [];
  const repliesByParent: Record<string, TComment[]> = {};

  comments.forEach((comment) => {
    if (!comment.parentId || !loadedCommentIds.has(comment.parentId)) {
      roots.push(comment);
      return;
    }

    const siblings = repliesByParent[comment.parentId] ?? [];
    siblings.push(comment);
    repliesByParent[comment.parentId] = siblings;
  });

  return { roots, repliesByParent };
};
