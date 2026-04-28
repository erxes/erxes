import { DraftState } from '@/settings/tags/types/tagTree';
import { IconCircleFilled, IconCirclesFilled } from '@tabler/icons-react';
import { cn, useToast } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TagDraftRowProps {
  draft: DraftState;
  depth: number;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}

const BASE_LEFT = 8;
const INDENT_PER_LEVEL = 24;

export const TagDraftRow = ({
  draft,
  depth,
  onSave,
  onCancel,
}: TagDraftRowProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });
  const [name, setName] = useState(draft.name ?? '');
  const [description, setDescription] = useState(draft.description ?? '');
  const nameRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);
  const paddingLeft = BASE_LEFT + depth * INDENT_PER_LEVEL;

  const handleSave = () => {
    if (cancelledRef.current) return;
    const trimmed = name.trim();
    if (!trimmed) {
      onCancel();
      return;
    }
    onSave(trimmed, description);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = name.trim();
      if (!trimmed) {
        toast({
          title: t('error'),
          description: t('name-required'),
          variant: 'destructive',
        });
        return;
      }
      onSave(trimmed, description);
    } else if (e.key === 'Escape') {
      cancelledRef.current = true;
      onCancel();
    }
  };

  return (
    <div
      className={cn(
        'h-10 w-full shadow-xs flex items-center pr-12 bg-primary/5 relative',
      )}
    >
      {/* Checkbox spacer */}
      <div className="w-10 shrink-0" />

      {/* Color dot + name indented like a tag row */}
      <div
        className="flex-1 min-w-0 flex items-center gap-1 h-full"
        style={{ paddingLeft }}
      >
        {/* Color dot */}
        <div className="w-7 flex items-center justify-center shrink-0">
          {draft.kind === 'group' ? (
            <IconCirclesFilled
              className="size-3"
              style={{ color: draft.colorCode }}
            />
          ) : (
            <IconCircleFilled
              className="size-3"
              style={{ color: draft.colorCode }}
            />
          )}
        </div>

        {/* Name input */}
        <input
          ref={nameRef}
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={t('add-tag-name') || 'Add tag name...'}
          maxLength={64}
          className="flex-1 min-w-0 bg-transparent text-xs font-medium outline-none border-none placeholder:text-muted-foreground/50"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Description input */}
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const trimmed = name.trim();
              if (trimmed) onSave(trimmed, description);
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
          placeholder={t('add-description') || 'Add description...'}
          maxLength={255}
          className="w-64 max-md:hidden bg-transparent text-xs outline-none border-none placeholder:text-muted-foreground/40 text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};
