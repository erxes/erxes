import { useTranslation } from 'react-i18next';
import { formatEntityLabel } from '../utils/entityLabel';

/**
 * The name of the records being imported or exported, in the user's language.
 *
 * Collection names are English identifiers, so a translation is used whenever
 * one exists and the derived English label is the fallback for the entity
 * types plugins bring along.
 */
export const useEntityLabel = (
  collectionName: string,
  options?: { plural?: boolean; capitalize?: boolean },
) => {
  const { t } = useTranslation('importExport');

  return t(`entity-${collectionName}`, {
    defaultValue: formatEntityLabel(collectionName, options),
  });
};
