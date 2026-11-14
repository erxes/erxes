import { useManageRelations } from 'ui-modules';
import { useCreatedPanelRecord } from './useCreatedPanelRecord';

/** Saves draft contact links before replacing the draft with its created record. */
export const useCreatedContactPanelRecord = (
  contentType: 'core:customer' | 'core:company',
  relatedContentIds: string[],
): { onCreated: (id: string) => void; linking: boolean } => {
  const showCreatedRecord = useCreatedPanelRecord(contentType);
  const { manageRelations, loading: linking } = useManageRelations();
  const relatedContentType =
    contentType === 'core:customer' ? 'core:company' : 'core:customer';
  const onCreated = (id: string) => {
    if (relatedContentIds.length === 0) {
      showCreatedRecord(id);
      return;
    }
    // Creation already succeeded. On a link error, the shared mutation shows
    // feedback and the created record opens so Save cannot create a duplicate.
    manageRelations({
      contentType,
      contentId: id,
      relatedContentType,
      relatedContentIds,
    }).then(
      () => showCreatedRecord(id),
      () => showCreatedRecord(id),
    );
  };
  return { onCreated, linking };
};
