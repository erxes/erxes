import { useState } from 'react';
import { Button, Spinner, Textarea } from 'erxes-ui';
import { usePostComments } from '../hooks/usePostComments';

interface PostCommentsProps {
  postId: string;
  clientPortalId: string;
  allowComments?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
};

export const PostComments = ({
  postId,
  clientPortalId,
  allowComments,
}: PostCommentsProps) => {
  const {
    comments,
    totalCount,
    loading,
    adding,
    addComment,
    updateComment,
    deleteComment,
    changeStatus,
  } = usePostComments({ postId, clientPortalId });

  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAdd = async () => {
    const trimmed = newContent.trim();
    if (!trimmed) return;
    await addComment(trimmed);
    setNewContent('');
  };

  const handleEditStart = (comment: any) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const handleEditSave = async (_id: string) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    await updateComment(_id, trimmed);
    setEditingId(null);
  };

  const handleDelete = async (_id: string) => {
    if (!window.confirm('Delete this comment?')) return;
    await deleteComment(_id);
  };

  return (
    <div className="px-4 pb-8 mt-6 border-t pt-6">
      <h3 className="text-base font-semibold mb-4">
        Comments ({totalCount})
      </h3>

      {allowComments === false && (
        <div className="mb-4 rounded bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 text-sm">
          Comments are disabled for this site. Existing comments are shown below for moderation.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {comments.length === 0 && (
            <p className="text-sm text-gray-400">No comments yet.</p>
          )}
          {comments.map((comment: any) => (
            <div
              key={comment._id}
              className={`border rounded p-3 text-sm${
                comment.parentId ? ' ml-6' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">{comment.authorId}</span>
                <span className="text-xs text-gray-400">{comment.authorKind}</span>
                <span
                  className={`text-xs rounded px-1.5 py-0.5 font-medium ${
                    STATUS_COLORS[comment.status] ?? ''
                  }`}
                >
                  {comment.status}
                </span>
                {comment.createdAt && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                )}
              </div>

              {editingId === comment._id ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setEditContent(e.target.value)
                    }
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleEditSave(comment._id)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
              )}

              {editingId !== comment._id && (
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditStart(comment)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(comment._id)}
                  >
                    Delete
                  </Button>
                  {comment.status !== 'approved' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => changeStatus(comment._id, 'approved')}
                    >
                      Approve
                    </Button>
                  )}
                  {comment.status === 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeStatus(comment._id, 'rejected')}
                    >
                      Reject
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {allowComments !== false && (
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment…"
            value={newContent}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewContent(e.target.value)
            }
            rows={3}
          />
          <Button
            variant="default"
            size="sm"
            onClick={handleAdd}
            disabled={adding || !newContent.trim()}
          >
            {adding ? 'Posting…' : 'Add Comment'}
          </Button>
        </div>
      )}
    </div>
  );
};
