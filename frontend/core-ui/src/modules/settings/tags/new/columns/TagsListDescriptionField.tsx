import { useEffect, useRef, useState } from 'react';
import { Popover, Badge, Textarea, TextOverflowTooltip } from 'erxes-ui';
import { useTagsEdit } from 'ui-modules/modules/tags/hooks/useTagsEdit';
import { TagsListCell } from '../TagsListCell';

export const TagsListDescriptionField = ({
  description,
  id,
}: {
  description: string;
  id?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [descriptionState, setDescriptionState] = useState(description);
  const { tagsEdit } = useTagsEdit();

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      requestAnimationFrame(() => {
        textarea.style.height = '0px';
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.focus();
        const length = textarea.value.length;
        textarea.setSelectionRange(length, length);
      });
    });
  }, [descriptionState, isOpen]);

  const handleSave = () => {
    if (descriptionState === description) return;

    if (id) {
      tagsEdit({
        variables: {
          id,
          description: descriptionState,
        },
        onError: () => {
          setDescriptionState(description);
        },
      });
    }
  };

  return (
    <TagsListCell className="flex-1 max-md:hidden pr-5">
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            handleSave();
          }
        }}
      >
        <Popover.Trigger asChild>
          <Badge
            variant="ghost"
            className="min-w-[200px] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {descriptionState ? (
              <TextOverflowTooltip
                delayDuration={300}
                className="text-xs font-medium"
                value={descriptionState}
              />
            ) : (
              <p className="text-xs font-medium text-accent-foreground invisible group-hover:visible">
                Add tag description...
              </p>
            )}
          </Badge>
        </Popover.Trigger>
        <Popover.Content
          align="start"
          sideOffset={-24}
          disableTransition
          className="w-[var(--radix-popover-trigger-width)] bg-accent max-w-none p-0 rounded-sm min-w-[25%] shadow-xs transition-none"
        >
          <Textarea
            ref={textareaRef}
            onChange={(e) => setDescriptionState(e.target.value)}
            value={descriptionState}
            placeholder="Add tag description..."
            className="focus-visible:ring-0 focus-visible:shadow-none resize-none text-xs! font-medium min-h-0 px-2 py-[calc((24px-var(--text-xs--line-height))/2)] overflow-hidden "
            maxLength={255}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setIsOpen(false);
                handleSave();
              }
            }}
            autoFocus
          />
        </Popover.Content>
      </Popover>
    </TagsListCell>
  );
};
