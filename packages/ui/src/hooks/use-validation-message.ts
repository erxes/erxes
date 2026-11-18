import type { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

type Field = HTMLInputElement | HTMLTextAreaElement;

/** The message for the first broken rule of the field, in the UI's language. */
const messageOf = (field: Field, t: TFunction<'ui', 'validation'>) => {
  const { validity } = field;
  const type = field instanceof HTMLInputElement ? field.type : 'textarea';

  if (validity.valueMissing) return t('required', 'Fill in this field.');

  if (validity.typeMismatch && type === 'email') return t('email', 'Enter an email address.');

  if (validity.typeMismatch && type === 'url') return t('url', 'Enter a web address.');

  if (validity.tooShort) {
    return t('too-short', 'Use at least {{count}} characters.', { count: field.minLength });
  }

  if (validity.tooLong) {
    return t('too-long', 'Use at most {{count}} characters.', { count: field.maxLength });
  }

  if (field instanceof HTMLInputElement && validity.rangeUnderflow) {
    return t('too-small', 'Enter {{min}} or more.', { min: field.min });
  }

  if (field instanceof HTMLInputElement && validity.rangeOverflow) {
    return t('too-large', 'Enter {{max}} or less.', { max: field.max });
  }

  if (validity.patternMismatch) return t('pattern', 'Match the format asked for.');

  return t('invalid', 'Enter a valid value.');
};

/**
 * An `onInvalid` handler that gives the browser's check of `required`, `type`, `minLength` and
 * the like a message in the UI's language; the browser writes its own in the browser's language.
 * It calls the caller's `onInvalid` after, and leaves a message the caller set itself.
 */
export const useValidationMessage = <E extends SyntheticEvent<Field>>(
  onInvalid?: (event: E) => void,
) => {
  const { t } = useTranslation('ui', { keyPrefix: 'validation' });

  return (event: E) => {
    const field = event.currentTarget;

    if (!field.validity.customError) {
      field.setCustomValidity(messageOf(field, t));
      // The message is for this check only: the next one reads the field as it is then.
      setTimeout(() => field.setCustomValidity(''));
    }

    onInvalid?.(event);
  };
};
