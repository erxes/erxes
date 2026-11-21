import { isApiError, messageOf } from '@erxes/core-contract/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** What a failed data model or value call tells the member, by its code. */
export const useDataErrorText = () => {
  const { t } = useTranslation('data', { keyPrefix: 'errors' });

  return (error: unknown) => {
    if (isApiError(error, 'ARCHIVE_FIRST')) {
      return t('archive-first', 'Archive it first: only an archived one can be deleted.');
    }

    if (isApiError(error, 'FIELD_IN_USE')) {
      return t(
        'field-in-use',
        'A formula, rollup, condition or label uses this field. Change that first.',
      );
    }

    if (isApiError(error, 'TAKEN')) {
      return t('taken', 'Another one already has this {{field}}.', { field: error.data.field });
    }

    if (isApiError(error, 'NOT_ALLOWED')) {
      return t('not-allowed', 'You may not change this.');
    }

    if (isApiError(error, 'SCHEMA_BUSY')) {
      return t('schema-busy', 'Another change to the data model is running. Try again.');
    }

    if (isApiError(error, 'LIMIT_EXCEEDED')) {
      return t('limit', 'You have reached the most this allows.');
    }

    if (isApiError(error, 'UNCONVERTIBLE')) {
      return t('unconvertible', '{{count}} values don’t fit the new type.', {
        count: error.data.count,
      });
    }

    return messageOf(error);
  };
};

/** A toast for a failed call, titled `title`. */
export const useDataErrorToast = () => {
  const { t } = useTranslation('data', { keyPrefix: 'errors' });
  const { toast } = useToast();
  const text = useDataErrorText();

  return (error: unknown, title?: string) =>
    toast({
      variant: 'destructive',
      title: title ?? t('failed', 'Could not save'),
      description: text(error),
    });
};
