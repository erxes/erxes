import { IconPlus } from '@tabler/icons-react';
import { RecordTableInlineCell } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TagsSelect } from 'ui-modules';
import { ContactDetailSection } from './ContactDetailSection';

/** Keeps the tag picker visible when a contact has no tags yet. */
export const ContactPanelTags = ({
  contentType,
  contentId,
  tagIds,
}: {
  contentType: 'core:customer' | 'core:company';
  contentId: string;
  tagIds?: string[];
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const kind = contentType === 'core:customer' ? 'customer' : 'company';

  return (
    <ContactDetailSection title={t('tags', 'Tags')}>
      <TagsSelect.Provider
        type={contentType}
        mode="multiple"
        scope={`side-panel-${kind}.tags`}
        value={tagIds}
        targetIds={[contentId]}
        options={(nextTagIds) => ({
          update: (cache) => {
            cache.modify({
              id: cache.identify({
                __typename: kind === 'customer' ? 'Customer' : 'Company',
                _id: contentId,
              }),
              fields: { tagIds: () => nextTagIds },
              optimistic: true,
            });
          },
        })}
      >
        <RecordTableInlineCell.Trigger
          className="rounded-sm"
          aria-label={t('edit-tags', 'Edit tags')}
        >
          <TagsSelect.SelectedList
            maxVisible={3}
            className="min-w-0 overflow-hidden"
          />
          {!tagIds?.length && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IconPlus className="size-3.5" aria-hidden="true" />
              {t('add-tags', 'Add tags')}
            </span>
          )}
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <TagsSelect.Content />
        </RecordTableInlineCell.Content>
      </TagsSelect.Provider>
    </ContactDetailSection>
  );
};
