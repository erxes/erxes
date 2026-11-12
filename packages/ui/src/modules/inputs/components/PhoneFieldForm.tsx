import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui/components/button';
import { Separator } from 'erxes-ui/components/separator';
import { PhoneInput } from 'erxes-ui/modules/record-field/meta-inputs/components/PhoneInput';
import { ValidationStatus } from 'erxes-ui/types/ValidationStatus';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePhoneFields } from '../contexts/PhoneFieldsContext';

/** Focuses the input once it shows, after the popover has opened. */
const useFocusWhenShown = (showInput: boolean) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showInput) return;

    const timer = setTimeout(() => inputRef.current?.focus(), 180);

    return () => clearTimeout(timer);
  }, [showInput]);

  return inputRef;
};

/**
 * Adds a phone, or replaces the one being edited. PhoneField renders it keyed by the
 * phone being edited, so the draft starts from that phone.
 */
export const PhoneFieldForm = () => {
  const { phones, onValueChange, showInput, openInput, editingPhone, closeInput } =
    usePhoneFields();

  const { t } = useTranslation('contact', { keyPrefix: 'customer.detail' });
  const [draft, setDraft] = useState(editingPhone ?? '');
  const [isValid, setIsValid] = useState(true);
  const inputRef = useFocusWhenShown(showInput);
  const label = editingPhone ? t('edit-phone') : t('add-phone');

  const save = () => {
    if (!isValid || !draft) return;

    if (editingPhone) {
      onValueChange(
        phones.map((item) => (item.phone === editingPhone ? { ...item, phone: draft } : item)),
      );
    } else {
      const isFirst = phones.length === 0;

      onValueChange([
        ...phones,
        { phone: draft, status: ValidationStatus.Invalid, isPrimary: isFirst || undefined },
      ]);
    }

    setDraft('');
    closeInput();
  };

  return (
    <>
      {showInput && (
        <div className="px-1 pb-1">
          <PhoneInput
            ref={inputRef}
            placeholder={label}
            defaultCountry="MN"
            value={draft}
            onChange={setDraft}
            onValidationChange={setIsValid}
            onEnter={save}
          />
        </div>
      )}
      <Separator />
      <div className="p-1">
        <Button
          variant="secondary"
          className="w-full"
          disabled={showInput && !isValid && draft.length > 0}
          onClick={showInput ? save : openInput}
        >
          <IconPlus />
          {label}
        </Button>
      </div>
    </>
  );
};
