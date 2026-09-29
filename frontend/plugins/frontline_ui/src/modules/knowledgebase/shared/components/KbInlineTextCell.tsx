import {
  Input,
  PopoverScoped,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { ReactNode, useRef, useState } from 'react';

export const KbInlineTextCell = ({
  value,
  placeholder,
  scope,
  onSave,
  children,
}: {
  value: string;
  placeholder?: string;
  scope: string;
  onSave: (next: string) => void;
  children?: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const saved = useRef(false);

  const handleSave = () => {
    if (saved.current) return;

    const next = draft.trim();

    if (next === value) return;

    saved.current = true;
    onSave(next);
  };

  return (
    <PopoverScoped
      scope={scope}
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setDraft(value);
          saved.current = false;
          setOpen(true);
          return;
        }

        handleSave();
        setOpen(false);
      }}
    >
      <RecordTableInlineCell.Trigger>
        {children ?? <TextOverflowTooltip value={value || placeholder} />}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="min-w-72">
        <Input
          value={draft}
          placeholder={placeholder}
          autoFocus
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;

            event.preventDefault();
            handleSave();
            setOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
