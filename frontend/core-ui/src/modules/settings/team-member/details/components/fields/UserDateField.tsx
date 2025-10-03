import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { IDetailsType } from '@/settings/team-member/types';
import { DatePicker } from 'erxes-ui';
import React from 'react';

interface TDateField {
  details: IDetailsType & { __typename?: string };
  _id: string;
  field: keyof IDetailsType;
}

export const UserDateField = ({
  details,
  _id,
  field,
  ...props
}: Omit<React.ComponentProps<typeof DatePicker>, 'onChange'> & TDateField) => {
  const { __typename, ...rest } = details || {};
  const { usersEdit } = useUserEdit();

  const onSave = (newDate: Date) => {
    usersEdit({
      variables: {
        _id,
        details: {
          ...rest,
          [field]: newDate,
        },
      },
    });
  };

  return (
    <DatePicker
      value={props.value as Date}
      className={props.className}
      defaultMonth={props.value as Date}
      onChange={(date) => {
        if (date !== props.value) {
          onSave(date as Date);
        }
      }}
      variant={field === 'birthDate' ? 'outline' : 'ghost'}
      mode="single"
    />
  );
};
