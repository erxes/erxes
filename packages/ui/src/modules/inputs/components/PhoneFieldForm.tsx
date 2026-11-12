import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui/components/button';
import { Separator } from 'erxes-ui/components/separator';
import { PhoneInput } from 'erxes-ui/modules/record-field/meta-inputs/components/PhoneInput';
import { ValidationStatus } from 'erxes-ui/types/ValidationStatus';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusWhenShown, type ContactFieldInput } from '../hooks/useContactFieldInput';
import type { TPhones } from '../types/phoneField';

/**
 * Adds a phone, or replaces the one being edited. PhoneField renders it keyed by the
 * phone being edited, so the draft starts from that phone.
 */
export const PhoneFieldForm = ({
  phones,
  onValueChange,
  input,
}: {
  phones: TPhones;
  onValueChange: (phones: TPhones) => void;
  input: ContactFieldInput;
}) => {
  const { showInput, openInput, editing, closeInput } = input;
  const { t } = useTranslation('contact', { keyPrefix: 'customer.detail' });
  const [draft, setDraft] = useState(editing ?? '');
  const [isValid, setIsValid] = useState(true);
  const inputRef = useFocusWhenShown(showInput);
  const label = editing ? t('edit-phone') : t('add-phone');

  const save = () => {
    if (!isValid || !draft) return;

    if (editing) {
      onValueChange(
        phones.map((item) => (item.phone === editing ? { ...item, phone: draft } : item)),
      );
    } else {
      onValueChange([
        ...phones,
        { phone: draft, status: ValidationStatus.Invalid, isPrimary: phones.length === 0 },
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
