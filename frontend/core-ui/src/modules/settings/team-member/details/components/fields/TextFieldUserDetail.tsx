import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { cn, Input } from 'erxes-ui';
import { useState } from 'react';

interface TextFieldProps {
  field: string;
  fieldId?: string;
  _id: string;
}

export const TextFieldUserDetail = ({
  field,
  _id,
  ...props
}: Omit<React.ComponentProps<typeof Input>, 'onChange'> & TextFieldProps) => {
  const { usersEdit } = useUserEdit();
  const [editingValue, setEditingValue] = useState<string>(
    String(props.value ?? ''),
  );

  const onSave = () => {
    if (editingValue !== props.value) {
      usersEdit({
        variables: { _id, [field]: editingValue },
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
      setEditingValue(props.value as string);
    }
  };

  return (
    <Input
      {...props}
      value={editingValue}
      onChange={(e) => setEditingValue(e.currentTarget.value)}
      onBlur={onSave}
      onKeyDown={handleKeyDown}
      className={cn('shadow-xs rounded-sm text-sm', props.className)}
    />
  );
};
