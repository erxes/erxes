import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { IDetailsType } from '@/settings/team-member/types';
import { cn, Textarea } from 'erxes-ui';
import { ComponentProps, useRef, useState } from 'react';

interface IDetails extends IDetailsType {
  __typename?: string;
  description?: string;
}

type Props = {
  _id: string;
  field: keyof IDetails;
  details: IDetails;
};

export const TextareaField = ({
  _id,
  field,
  details,
  ...props
}: Omit<ComponentProps<typeof Textarea>, 'onChange' | 'onKeyDown' | 'onBlur'> &
  Props) => {
  const { __typename, description, ...detailsRest } = details || {};
  const { usersEdit } = useUserEdit();
  const { value, className, ...rest } = props || {};
  const ref = useRef<HTMLTextAreaElement>(null);
  const [editingValue, setEditingValue] = useState(value || '');

  const onSave = () => {
    if (editingValue !== value) {
      usersEdit({
        variables: { _id, details: { ...detailsRest, [field]: editingValue } },
      });
    }
    return;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingValue(value || '');
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave();
    }
  };

  return (
    <Textarea
      {...rest}
      value={editingValue as string}
      ref={ref}
      className={cn(className, 'bg-transparent shadow-xs')}
      onChange={(e) => setEditingValue(e.currentTarget.value)}
      onKeyDown={handleKeyDown}
      onBlur={onSave}
    />
  );
};
