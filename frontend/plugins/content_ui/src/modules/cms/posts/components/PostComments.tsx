import { useMemo, useState } from 'react';
import {
  AlertDialog,
  Avatar,
  Badge,
  Button,
  Skeleton,
  Spinner,
  Textarea,
  Tooltip,
  cn,
} from 'erxes-ui';
import { MembersInline } from 'ui-modules';
import {
  IconCheck,
  IconMessageOff,
  IconMoodSmile,
  IconPencil,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { usePostComments } from '../hooks/usePostComments';

interface PostCommentsProps {
  postId: string;
  clientPortalId: string;
  allowComments?: boolean;
}

type CommentStatus = 'approved' | 'pending' | 'rejected';

interface IComment {
  _id: string;
  content: string;
  authorId: string;
  authorKind: 'user' | 'portalUser';
  parentId?: string | null;
  status: CommentStatus;
  createdAt?: string;
  updatedAt?: string;
}

const STATUS_VARIANT: Record<CommentStatus, 'success' | 'warning' | 'destructive'> =
  {
    approved: 'success',
    pending: 'warning',
    rejected: 'destructive',
  };

const formatRelativeTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const sec = Math.round(diff / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  if (sec < 60) return 'just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString();
};

const AuthorIdentity = ({ comment }: { comment: IComment }) => {
  if (comment.authorKind === 'user') {
    return (
      <MembersInline memberIds={[comment.authorId]} size="lg" />
    );
  }

  // Client-portal visitor — no team-member record to resolve.
  const initial = comment.authorId?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar size="lg">
        <Avatar.Fallback className="bg-primary/10 text-primary">
          {initial}
        </Avatar.Fallback>
      </Avatar>
      <span className="truncate text-sm font-medium">Portal visitor</span>
    </div>
  );
};

const CommentItem = ({
  comment,
  isReply,
  editingId,
  editContent,
  setEditContent,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
  onChangeStatus,
  busy,
}: {
  comment: IComment;
  isReply?: boolean;
  editingId: string | null;
  editContent: string;
  setEditContent: (v: string) => void;
  onEditStart: (c: IComment) => void;
  onEditSave: (id: string) => void;
  onEditCancel: () => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: CommentStatus) => void;
  busy: boolean;
}) => {
  const isEditing = editingId === comment._id;

  return (
    <div
      className={cn(
        'group rounded-lg border bg-card p-3 transition-colors hover:border-foreground/20',
        isReply && 'ml-8 border-l-2 border-l-primary/30',
      )}
    >
      <div className="flex items-center gap-2">
        <AuthorIdentity comment={comment} />
        <Badge variant={STATUS_VARIANT[comment.status]} className="capitalize">
          {comment.status}
        </Badge>
        {comment.createdAt && (
          <Tooltip>
            <Tooltip.Trigger asChild>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {new Date(comment.createdAt).toLocaleString()}
            </Tooltip.Content>
          </Tooltip>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3 space-y-2">
          <Textarea
            value={editContent}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setEditContent(e.target.value)
            }
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onEditCancel}>
              <IconX /> Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onEditSave(comment._id)}
              disabled={busy || !editContent.trim()}
            >
              <IconCheck /> Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground">
          {comment.content}
        </p>
      )}

      {!isEditing && (
        <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          {comment.status !== 'approved' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-success hover:text-success"
              onClick={() => onChangeStatus(comment._id, 'approved')}
            >
              <IconCheck /> Approve
            </Button>
          )}
          {comment.status === 'approved' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-warning hover:text-warning"
              onClick={() => onChangeStatus(comment._id, 'rejected')}
            >
              <IconX /> Reject
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEditStart(comment)}>
            <IconPencil /> Edit
          </Button>

          <AlertDialog>
            <AlertDialog.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <IconTrash /> Delete
              </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
              <AlertDialog.Header>
                <AlertDialog.Title>Delete comment?</AlertDialog.Title>
                <AlertDialog.Description>
                  This comment will be permanently removed. This action cannot be
                  undone.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <AlertDialog.Action
                  onClick={() => onDelete(comment._id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog>
        </div>
      )}
    </div>
  );
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
    updating,
    deleting,
    addComment,
    updateComment,
    deleteComment,
    changeStatus,
  } = usePostComments({ postId, clientPortalId });

  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const busy = adding || updating || deleting;

  // Group flat list into top-level comments + their replies.
  const { topLevel, repliesByParent } = useMemo(() => {
    const top: IComment[] = [];
    const byParent: Record<string, IComment[]> = {};
    (comments as IComment[]).forEach((c) => {
      if (c.parentId) {
        (byParent[c.parentId] ??= []).push(c);
      } else {
        top.push(c);
      }
    });
    return { topLevel: top, repliesByParent: byParent };
  }, [comments]);

  const handleAdd = async () => {
    const trimmed = newContent.trim();
    if (!trimmed) return;
    await addComment(trimmed);
    setNewContent('');
  };

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleEditStart = (comment: IComment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const handleEditSave = async (_id: string) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    await updateComment(_id, trimmed);
    setEditingId(null);
  };

  const itemProps = {
    editingId,
    editContent,
    setEditContent,
    onEditStart: handleEditStart,
    onEditSave: handleEditSave,
    onEditCancel: () => setEditingId(null),
    onDelete: (id: string) => deleteComment(id),
    onChangeStatus: (id: string, status: CommentStatus) =>
      changeStatus(id, status),
    busy,
  };

  return (
    <div className="mt-6 border-t px-4 pb-8 pt-6">
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-base font-semibold">Comments</h3>
        <Badge variant="secondary">{totalCount}</Badge>
      </div>

      {allowComments === false && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-info/20 bg-info/10 px-3 py-2 text-sm text-info">
          <IconMessageOff className="size-4 shrink-0" />
          <span>
            Comments are disabled for this site. Existing comments remain visible
            for moderation.
          </span>
        </div>
      )}

      {allowComments !== false && (
        <div className="mb-6 rounded-lg border bg-card p-3">
          <Textarea
            placeholder="Write a comment…"
            value={newContent}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewContent(e.target.value)
            }
            onKeyDown={handleAddKeyDown}
            rows={3}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Press ⌘/Ctrl + Enter to submit
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={handleAdd}
              disabled={adding || !newContent.trim()}
            >
              {adding ? <Spinner size="sm" /> : <IconMoodSmile />}
              {adding ? 'Posting…' : 'Comment'}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="mt-3 h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-muted-foreground">
          <IconMoodSmile className="size-8 opacity-50" />
          <p className="text-sm">No comments yet. Be the first to comment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topLevel.map((comment) => (
            <div key={comment._id} className="space-y-3">
              <CommentItem comment={comment} {...itemProps} />
              {repliesByParent[comment._id]?.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  isReply
                  {...itemProps}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
