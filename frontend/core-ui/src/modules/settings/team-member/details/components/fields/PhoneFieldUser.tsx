import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { IUserDetailsType } from '@/settings/team-member/types';
import { PhoneInput } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PhoneFieldUserProps {
  _id: string;
  details: IUserDetailsType & { __typename?: string };
}

export const PhoneFieldUser = ({ _id, details }: PhoneFieldUserProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { __typename, operatorPhone, ...rest } = details || {};
  const { usersEdit } = useUserEdit();
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [editingValue, setEditingValue] = useState(operatorPhone || '');
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSave = () => {
    if (!isPhoneValid) {
      setErrorMessage(t('invalid-phone-number'));
      return;
    }
    const normalizedPhone = editingValue.replace(/\D/g, '');

    if (normalizedPhone === (operatorPhone ?? '')) {
      return;
    }

    usersEdit({
      variables: {
        _id,
        details: {
          ...rest,
          operatorPhone: normalizedPhone === '' ? null : normalizedPhone,
        },
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingValue(operatorPhone || '');
    }
  };

  return (
    <>
      <PhoneInput
        value={editingValue}
        ref={phoneInputRef}
        className="bg-transparent"
        onChange={(value) => setEditingValue(value)}
        onEnter={handleSave}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onValidationChange={(isValid) => setIsPhoneValid(isValid)}
      />
      {!isPhoneValid && errorMessage ? (
        <span className="text-destructive text-xs">{errorMessage}</span>
      ) : null}
    </>
  );
};
