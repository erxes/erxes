import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { IDetailsType } from '@/settings/team-member/types';
import { Input } from 'erxes-ui';
import React from 'react';

interface Props {
  field: keyof IDetailsType;
  _id: string;
  details: IDetailsType & { __typename?: string };
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
    return;
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave();
    }
    if (e.key === 'Escape') {
      setEditingValue(props.value);
    }
  };

  return (
    <Input
      {...props}
      value={editingValue}
      onChange={(event) => setEditingValue(event.currentTarget.value || '')}
      onKeyDown={handleKeyDown}
      onBlur={onSave}
    />
  );
};
