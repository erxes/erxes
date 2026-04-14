import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { IUserDetailsType } from '@/settings/team-member/types';
import { Input } from 'erxes-ui';
import React from 'react';

interface Props {
  field: keyof IUserDetailsType;
  _id: string;
  details: IUserDetailsType & { __typename?: string };
}

export const DetailsField = ({
  field,
  details,
  _id,
  ...props
}: Omit<React.ComponentProps<typeof Input>, 'scope' | 'onChange'> & Props) => {
  const { __typename, ...rest } = details || {};
  const { usersEdit } = useUserEdit();
  const [editingValue, setEditingValue] = React.useState<
    string | number | readonly string[] | undefined
  >(props.value);
  const justSavedRef = React.useRef(false);

  const onSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editingValue !== props.value) {
      usersEdit({
        variables: {
          _id,
          details: {
            ...rest,
            [field]: editingValue,
          },
        },
      });
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave();
      justSavedRef.current = true;
    }
    if (e.key === 'Escape') {
      setEditingValue(props.value);
    }
  };

  const handleBlur = () => {
    if (justSavedRef.current) {
      justSavedRef.current = false;
      return;
    }
    onSave();
  };

  return (
    <Input
      {...props}
      value={editingValue}
      onChange={(event) => {
        const val = event.currentTarget.value;
        setEditingValue(
          props.type === 'number' && val !== '' ? Number(val) : val || '',
        );
      }}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
};
