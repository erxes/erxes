import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useCompaniesTag } from '~/modules/contacts/companies/useCompanies';
import { tagChange } from '~/modules/contacts/components/MergeButton';
import { useCustomersTag } from '~/modules/contacts/customers/useCustomers';
import { TagsSelect } from '~/modules/tags/TagsSelect';
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
  // Through the tag endpoint, as the list's command bar does, so the timeline says what was added
  // or removed instead of "updated" with a tag diff.
  const customerTag = useCustomersTag();
  const companyTag = useCompaniesTag();
  const kind = contentType === 'core:customer' ? 'customer' : 'company';

  return (
    <ContactDetailSection title={t('tags', 'Tags')}>
      {/* Named by what it shows (the tags, or "Add tags"), so the spoken name matches the visible one. */}
      <TagsSelect.InlineCell
        type={kind}
        scope={`side-panel-${kind}.tags`}
        value={tagIds ?? []}
        onValueChange={(nextTagIds) =>
          (kind === 'customer' ? customerTag : companyTag).mutate({
            ids: [contentId],
            ...tagChange(tagIds ?? [], nextTagIds),
          })
        }
        maxVisible={3}
        className="rounded-sm"
        label={t('edit-tags', 'Edit tags')}
        placeholder={
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconPlus className="size-3.5" aria-hidden="true" />
            {t('add-tags', 'Add tags')}
          </span>
        }
      />
    </ContactDetailSection>
  );
};
