import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { IDetailsType } from '@/settings/team-member/types';
import { PhoneInput } from 'erxes-ui';
import { useRef, useState } from 'react';

interface PhoneFieldUserProps {
  _id: string;
  details: IDetailsType & { __typename?: string };
}

export const PhoneFieldUser = ({ _id, details }: PhoneFieldUserProps) => {
  const { __typename, operatorPhone, ...rest } = details || {};
  const { usersEdit } = useUserEdit();
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [editingValue, setEditingValue] = useState(operatorPhone || '');
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSave = () => {
    if (!isPhoneValid) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }
    if (editingValue === operatorPhone) {
      return;
    }

    usersEdit({
      variables: { _id, details: { ...rest, operatorPhone: editingValue } },
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
