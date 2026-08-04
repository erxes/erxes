import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { cn, Input } from 'erxes-ui';
import { useRef, useState } from 'react';

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
  const justSavedRef = useRef(false);

  const onSave = () => {
    if (editingValue !== props.value) {
      usersEdit({
        variables: {
          _id,
          [field]:
            props.type === 'number' && editingValue !== ''
              ? Number(editingValue)
              : editingValue,
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
      setEditingValue(props.value as string);
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
      onChange={(e) => setEditingValue(e.currentTarget.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn('shadow-xs rounded-sm text-sm', props.className)}
    />
  );
};
