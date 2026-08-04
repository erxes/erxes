import { TFunction } from 'i18next';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Badge,
  Button,
  Skeleton,
  Spinner,
  Textarea,
  Tooltip,
  cn,
} from 'erxes-ui';
import {
  MembersInline,
  currentUserState,
  usePermissionCheck,
} from 'ui-modules';
import {
  IconCheck,
  IconCornerDownRight,
  IconMessageOff,
  IconMoodSmile,
  IconPencil,
  IconX,
} from '@tabler/icons-react';
import {
  usePostComments,
  IPostComment,
  PostCommentStatus,
} from '../hooks/usePostComments';
import { groupPostCommentThreads } from '../utils/postCommentThreads';
import {
  PostModerationDeleteAction,
  PostModerationLoadMore,
} from './PostModerationControls';

interface PostCommentsProps {
  postId: string;
  clientPortalId: string;
  allowComments?: boolean;
}

type CommentStatus = PostCommentStatus;
type IComment = IPostComment;

interface CommentItemProps {
  comment: IComment;
  isReply?: boolean;
  editingId: string | null;
  editContent: string;
  setEditContent: (value: string) => void;
  onEditStart: (comment: IComment) => void;
  onEditSave: (id: string) => void;
  onEditCancel: () => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: CommentStatus) => void;
  onReplyStart: (id: string) => void;
  canApprove: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReply: boolean;
  busy: boolean;
}

const STATUS_VARIANT: Record<CommentStatus, 'success' | 'warning' | 'destructive'> =
  {
    approved: 'success',
    pending: 'warning',
    rejected: 'destructive',
  };

const formatRelativeTime = (value: string | undefined, t: TFunction) => {
  if (!value) return '';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const sec = Math.round(diff / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  if (sec < 60) return t('comment-just-now');
  if (min < 60) return t('comment-minutes-ago', { count: min });
  if (hr < 24) return t('comment-hours-ago', { count: hr });
  if (day < 7) return t('comment-days-ago', { count: day });
  return date.toLocaleDateString();
};

const AuthorIdentity = ({ comment }: { comment: IComment }) => {
  const { t } = useTranslation('content');

  if (comment.authorKind === 'user') {
    return <MembersInline memberIds={[comment.authorId]} size="lg" />;
  }

  const initial = comment.authorId?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size="lg">
        <Avatar.Fallback className="bg-primary/10 text-primary">
          {initial}
        </Avatar.Fallback>
      </Avatar>
      <span className="truncate text-sm font-medium">
        {t('portal-visitor')}
      </span>
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
  onReplyStart,
  canApprove,
  canEdit,
  canDelete,
  canReply,
  busy,
}: CommentItemProps) => {
  const { t } = useTranslation('content');
  const isEditing = editingId === comment._id;
  const showActions = canApprove || canEdit || canDelete || canReply;

  return (
    <div
      className={cn(
        'group rounded-lg border bg-card p-3 transition-colors hover:border-foreground/20',
        isReply && 'ml-8 border-l-2 border-l-primary/30',
      )}
    >
      <div className="flex items-center gap-2">
        <AuthorIdentity comment={comment} />
        <Badge variant={STATUS_VARIANT[comment.status]}>
          {t(`comment-status-${comment.status}`)}
        </Badge>
        {comment.createdAt && (
          <Tooltip>
            <Tooltip.Trigger asChild>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt, t)}
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
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              setEditContent(event.target.value)
            }
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onEditCancel}>
              <IconX /> {t('cancel')}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onEditSave(comment._id)}
              disabled={busy || !editContent.trim()}
            >
              <IconCheck /> {t('save')}
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground">
          {comment.content}
        </p>
      )}

      {!isEditing && showActions && (
        <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          {canApprove && comment.status !== 'approved' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-success hover:text-success"
              onClick={() => onChangeStatus(comment._id, 'approved')}
              disabled={busy}
            >
              <IconCheck /> {t('approve-comment')}
            </Button>
          )}
          {canApprove && comment.status !== 'rejected' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-warning hover:text-warning"
              onClick={() => onChangeStatus(comment._id, 'rejected')}
              disabled={busy}
            >
              <IconX /> {t('reject-comment')}
            </Button>
          )}
          {canReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReplyStart(comment._id)}
              disabled={busy}
            >
              <IconCornerDownRight /> {t('reply-to-comment')}
            </Button>
          )}
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStart(comment)}
              disabled={busy}
            >
              <IconPencil /> {t('edit')}
            </Button>
          )}

          {canDelete && (
            <PostModerationDeleteAction
              disabled={busy}
              title={t('delete-comment-title')}
              description={t('delete-comment-description')}
              onDelete={() => onDelete(comment._id)}
            />
          )}
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
  const { t } = useTranslation('content');
  const currentUser = useAtomValue(currentUserState);
  const { hasActionPermission } = usePermissionCheck();
  const {
    comments,
    totalCount,
    hasMore,
    error,
    loading,
    loadingMore,
    adding,
    updating,
    deleting,
    changingStatus,
    addComment,
    updateComment,
    deleteComment,
    changeStatus,
    loadMore,
  } = usePostComments({ postId, clientPortalId });

  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const canUpdate = hasActionPermission('cmsPostsUpdate');
  const canApprove = hasActionPermission('cmsPostsApprove');
  const canRemove = hasActionPermission('cmsPostsRemove');
  const canReply = allowComments !== false && canUpdate;
  const busy = adding || updating || deleting || changingStatus;

  const { roots, repliesByParent } = useMemo(
    () => groupPostCommentThreads(comments),
    [comments],
  );

  const handleAdd = async () => {
    const trimmed = newContent.trim();
    if (!trimmed) return;

    if (await addComment(trimmed)) {
      setNewContent('');
    }
  };

  const handleAddKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      void handleAdd();
    }
  };

  const handleEditStart = (comment: IComment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const handleEditSave = async (_id: string) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;

    if (await updateComment(_id, trimmed)) {
      setEditingId(null);
    }
  };

  const handleReply = async (parentId: string) => {
    const trimmed = replyContent.trim();
    if (!trimmed) return;

    if (await addComment(trimmed, parentId)) {
      setReplyingToId(null);
      setReplyContent('');
    }
  };

  const renderThread = (comment: IComment, depth: number): React.ReactNode => {
    const ownsComment =
      comment.authorKind === 'user' && comment.authorId === currentUser?._id;

    return (
      <div key={comment._id} className="space-y-3">
        <CommentItem
          comment={comment}
          isReply={depth > 0}
          editingId={editingId}
          editContent={editContent}
          setEditContent={setEditContent}
          onEditStart={handleEditStart}
          onEditSave={(id) => void handleEditSave(id)}
          onEditCancel={() => setEditingId(null)}
          onDelete={(id) => void deleteComment(id)}
          onChangeStatus={(id, status) => void changeStatus(id, status)}
          onReplyStart={(id) => {
            setReplyingToId(id);
            setReplyContent('');
          }}
          canApprove={canApprove}
          canEdit={canRemove || (canUpdate && ownsComment)}
          canDelete={canRemove || (canUpdate && ownsComment)}
          canReply={canReply}
          busy={busy}
        />

        {replyingToId === comment._id && canReply && (
          <div className="ml-8 rounded-lg border bg-card p-3">
            <Textarea
              placeholder={t('write-reply')}
              value={replyContent}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setReplyContent(event.target.value)
              }
              rows={2}
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyingToId(null);
                  setReplyContent('');
                }}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => void handleReply(comment._id)}
                disabled={adding || !replyContent.trim()}
              >
                {adding ? <Spinner size="sm" /> : <IconCornerDownRight />}
                {adding ? t('posting-comment') : t('post-reply')}
              </Button>
            </div>
          </div>
        )}

        {repliesByParent[comment._id]?.map((reply) =>
          renderThread(reply, depth + 1),
        )}
      </div>
    );
  };

  const renderBody = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="mt-3 h-4 w-3/4" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {t('failed-to-load-comments')}: {error.message}
        </div>
      );
    }

    if (roots.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-muted-foreground">
          <IconMoodSmile className="size-8 opacity-50" />
          <p className="text-sm">{t('no-comments-yet')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {roots.map((comment) => renderThread(comment, 0))}
        {hasMore && (
          <PostModerationLoadMore
            loading={loadingMore}
            loadingLabel={t('loading-comments')}
            loadMoreLabel={t('load-more-comments')}
            onLoadMore={() => void loadMore()}
          />
        )}
      </div>
    );
  };

  return (
    <div className="mt-6 border-t px-4 pb-8 pt-6">
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-base font-semibold">{t('comments')}</h3>
        <Badge variant="secondary">{totalCount}</Badge>
      </div>

      {allowComments === false && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-info/20 bg-info/10 px-3 py-2 text-sm text-info">
          <IconMessageOff className="size-4 shrink-0" />
          <span>{t('comments-disabled-description')}</span>
        </div>
      )}

      {allowComments !== false && canUpdate && (
        <div className="mb-6 rounded-lg border bg-card p-3">
          <Textarea
            placeholder={t('write-comment')}
            value={newContent}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewContent(event.target.value)
            }
            onKeyDown={handleAddKeyDown}
            rows={3}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t('comment-submit-shortcut')}
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={() => void handleAdd()}
              disabled={adding || !newContent.trim()}
            >
              {adding ? <Spinner size="sm" /> : <IconMoodSmile />}
              {adding ? t('posting-comment') : t('post-comment')}
            </Button>
          </div>
        </div>
      )}

      {renderBody()}
    </div>
  );
};
