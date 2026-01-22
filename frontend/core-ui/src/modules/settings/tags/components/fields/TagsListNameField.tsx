import { useEffect, useRef, useState } from 'react';
import {
  Popover,
  Badge,
  Textarea,
  useToast,
  TextOverflowTooltip,
  PopoverScoped,
} from 'erxes-ui';
import { useTagEdit } from 'ui-modules';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type Schema = z.infer<typeof schema>;

export const TagsListNameField = ({
  name,
  id,
  defaultOpen,
  handleSave,
  isForm = false,
  onEscape,
}: {
  name: string;
  id?: string;
  defaultOpen?: boolean;
  handleSave?: (name: string) => void;
  isForm?: boolean;
  onEscape?: () => void;
}) => {
  const [warned, setWarned] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen || false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { editTag } = useTagEdit();
  const { toast } = useToast();
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name,
    },
  });

  const watchedName = form.watch('name');
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
  }, [watchedName, isOpen]);

  const { ref: registerRef, ...restRegister } = form.register('name');

  const _handleSave = () => {
    const newName = form.getValues('name');

    if (newName) {
      if (newName === name) return;
      if (handleSave) {
        handleSave(form.getValues('name'));
        return;
      }
      if (id) {
        editTag({
          variables: {
            id,
            name: newName,
          },
        });
      }
    } else {
      form.setValue('name', name);
    }
  };
  if (!id && !isForm) {
    throw new Error(
      'Id is required when editing tag, Add id or use isForm prop',
    );
  }
  return (
    <PopoverScoped
      scope={SettingsHotKeyScope.TagsInput}
      modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!warned && !open && !form.getValues('name') && isForm) {
          setTimeout(() => textareaRef.current?.focus());
          toast({
            title: 'Error',
            description: 'Name cannot be empty',
            variant: 'destructive',
          });
          setWarned(true);
        } else {
          setIsOpen(open);
          onEscape?.();
          if (!open) _handleSave();
        }
      }}
    >
      <Popover.Trigger asChild>
        <Badge
          variant="ghost"
          className="max-w-[300px] min-w-[150px] cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {form.watch('name') ? (
            <TextOverflowTooltip
              delayDuration={300}
              className="text-xs font-medium truncate"
              value={form.watch('name')}
            />
          ) : (
            <p className="text-xs font-medium truncate  text-accent-foreground">
              Add tag name
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
          value={form.watch('name')}
          placeholder="Add tag name"
          className="focus-visible:ring-0 focus-visible:shadow-none resize-none text-xs! font-medium min-h-0 px-2 py-[calc((24px-var(--text-xs--line-height))/2)] overflow-hidden "
          maxLength={64}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              onEscape?.();
              return;
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              form.handleSubmit(
                () => {
                  _handleSave();
                  setIsOpen(false);
                },
                (e) => {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: Object.values(e)[0].message,
                  });
                },
              )();
            }
          }}
          {...restRegister}
          ref={(e) => {
            registerRef(e);
            textareaRef.current = e;
          }}
        />
      </Popover.Content>
    </PopoverScoped>
  );
};
