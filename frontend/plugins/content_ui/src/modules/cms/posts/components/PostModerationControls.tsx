import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AlertDialog, Button, Spinner } from 'erxes-ui';

interface PostModerationDeleteActionProps {
  disabled: boolean;
  title: string;
  description: string;
  onDelete: () => void;
}

export const PostModerationDeleteAction = ({
  disabled,
  title,
  description,
  onDelete,
}: PostModerationDeleteActionProps) => {
  const { t } = useTranslation('content');

  return (
    <AlertDialog>
      <AlertDialog.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={disabled}
        >
          <IconTrash /> {t('delete')}
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{description}</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>{t('cancel')}</AlertDialog.Cancel>
          <AlertDialog.Action
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('delete')}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};

interface PostModerationLoadMoreProps {
  loading: boolean;
  loadingLabel: string;
  loadMoreLabel: string;
  onLoadMore: () => void;
}

export const PostModerationLoadMore = ({
  loading,
  loadingLabel,
  loadMoreLabel,
  onLoadMore,
}: PostModerationLoadMoreProps) => (
  <div className="flex justify-center pt-2">
    <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loading}>
      {loading && <Spinner size="sm" />}
      {loading ? loadingLabel : loadMoreLabel}
    </Button>
  </div>
);
