import { Button, Textarea } from 'erxes-ui';

import { IconPlus } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const ChecklistItemAdd = ({
  adding,
  setAdding,
  newItem,
  setNewItem,
  handleAdd,
  handleKeyDown,
  loading,
  focusRequest,
}: Readonly<{
  adding: boolean;
  setAdding: React.Dispatch<React.SetStateAction<boolean>>;
  newItem: string;
  setNewItem: React.Dispatch<React.SetStateAction<string>>;
  handleAdd: () => void | Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  loading: boolean;
  focusRequest: number;
}>) => {
  const { t } = useTranslation('sales');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (adding && !loading) {
      textareaRef.current?.focus();
    }
  }, [adding, loading, focusRequest]);

  if (adding) {
    return (
      <div className="flex flex-col gap-2 p-2">
        <Textarea
          ref={textareaRef}
          placeholder={t('enter-items-each-on-new-line')}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={1}
          className="min-h-0 resize-none px-2 py-1.5 text-xs"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newItem.trim() || loading}
          >
            {t('add')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={loading}
            onClick={() => {
              setAdding(false);
              setNewItem('');
            }}
          >
            {t('cancel')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="justify-start gap-2 p-1 text-xs font-normal"
      onClick={() => setAdding(true)}
    >
      <span className="flex size-5 shrink-0 items-center justify-center">
        <IconPlus className="size-4" />
      </span>
      {t('add-an-item')}
    </Button>
  );
};
