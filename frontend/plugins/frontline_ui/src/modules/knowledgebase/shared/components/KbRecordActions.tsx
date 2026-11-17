import {
  IconCode,
  IconCopy,
  IconDotsVertical,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import { Button, DropdownMenu, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  useDuplicateArticle,
  useRemoveArticles,
} from '@/knowledgebase/articles/hooks/useArticleMutations';
import { useConfirmRemoveCategory } from '@/knowledgebase/categories/hooks/useConfirmRemoveCategory';
import {
  KB_RECORD_CONTENT_TYPES,
  KNOWLEDGE_BASE_PATH,
} from '@/knowledgebase/constants';
import { TopicEmbedScriptDialog } from '@/knowledgebase/shared/components/TopicEmbedScriptDialog';
import { useKbConfirmRemove } from '@/knowledgebase/shared/hooks/useKbConfirmRemove';
import type { IArticleDetail } from '@/knowledgebase/types';

export type TKbRecordKind = keyof typeof KB_RECORD_CONTENT_TYPES;

export const KbRecordActions = ({
  kind,
  id,
  title,
  topicId,
  article,
  onRemoved,
}: {
  kind: TKbRecordKind;
  id: string;
  title?: string | null;
  topicId: string;
  article?: IArticleDetail;
  onRemoved?: () => void;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useQueryState<string>('categoryId');
  const { duplicateArticle, loading: duplicating } =
    useDuplicateArticle(topicId);
  const { removeArticles, loading: removingArticle } = useRemoveArticles();
  const { confirmRemoveCategory, loading: removingCategory } =
    useConfirmRemoveCategory();
  const confirmRemove = useKbConfirmRemove();
  const [scriptOpen, setScriptOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const disabled =
    pending || duplicating || removingArticle || removingCategory;
  const actionsLabel = t('actions', {
    keyPrefix: '',
    defaultValue: 'Actions',
  });

  const handleDelete = async () => {
    if (disabled) return;
    try {
      if (kind === 'category') {
        await confirmRemoveCategory({ _id: id, title }, () => {
          if (categoryId === id) setCategoryId(null);
          onRemoved?.();
        });
      } else if (kind === 'article') {
        await confirmRemove({
          message: t('kb-confirm-delete-article', {
            title: title || t('kb-untitled-article', 'Untitled article'),
            defaultValue: 'Are you sure you want to delete "{{title}}"?',
          }),
          removedMessage: t('kb-article-deleted', 'Article deleted'),
          remove: async () => {
            setPending(true);
            try {
              await removeArticles([id]);
            } finally {
              setPending(false);
            }
          },
          onRemoved,
        });
      }
    } catch {
      return;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 flex-none"
            disabled={disabled}
            aria-label={actionsLabel}
            title={actionsLabel}
          >
            <IconDotsVertical />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          {article && (
            <DropdownMenu.Item
              disabled={disabled}
              onSelect={() => duplicateArticle(article)}
            >
              <IconCopy /> {t('kb-duplicate', 'Duplicate')}
            </DropdownMenu.Item>
          )}
          {kind === 'topic' && (
            <>
              <DropdownMenu.Item
                disabled={disabled}
                onSelect={() => setScriptOpen(true)}
              >
                <IconCode /> {t('kb-embed-script-title', 'Embed script')}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() =>
                  navigate(`${KNOWLEDGE_BASE_PATH}/${id}/kbsettings`)
                }
              >
                <IconSettings /> {t('settings', 'Settings')}
              </DropdownMenu.Item>
            </>
          )}
          {kind !== 'topic' && (
            <>
              {article && <DropdownMenu.Separator />}
              <DropdownMenu.Item
                className="text-destructive"
                disabled={disabled}
                onSelect={handleDelete}
              >
                <IconTrash /> {t('delete', 'Delete')}
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>
      {kind === 'topic' && (
        <TopicEmbedScriptDialog
          topicId={id}
          open={scriptOpen}
          onOpenChange={setScriptOpen}
          t={t}
        />
      )}
    </>
  );
};
