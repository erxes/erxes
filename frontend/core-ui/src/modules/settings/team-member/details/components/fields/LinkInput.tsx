import { Button, cn, Input, Label, Tooltip } from 'erxes-ui';
import React, { useState } from 'react';
import { Icon, IconLink, IconProps } from '@tabler/icons-react';
import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { UserLinks } from '@/settings/team-member/types';

type LinkFieldName = keyof UserLinks;

type Props = {
  links: UserLinks;
  _id: string;
  linkField: string;
  label: string;
  InputIcon?: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<Icon>
  >;
} & React.HTMLAttributes<HTMLButtonElement>;

export const LinkInput = React.forwardRef<HTMLButtonElement, Props>(
  ({ _id, links, linkField, label, InputIcon, ...props }, ref) => {
    const inputId = React.useId();

    const { usersEdit } = useUserEdit();
    const value = links?.[linkField as LinkFieldName] ?? '';

    const [editingValue, setEditingValue] = useState(value);

    React.useEffect(() => {
      setEditingValue(value);
    }, [value]);

    const handleSave = () => {
      if (editingValue === value) {
        return;
      }
      usersEdit({
        variables: {
          _id,
          links: {
            ...links,
            [linkField]: editingValue,
          },
        },
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingValue(value || '');
      }
    };

    function handleNavigate(
      event: React.MouseEvent<HTMLFieldSetElement, MouseEvent>,
    ): void {
      event.stopPropagation();

      if (!value) return;

      const trimmed = value.trim();

      let url = trimmed;

      if (linkField === 'discord' && /^\d{17,19}$/.test(trimmed)) {
        url = `https://discord.com/users/${trimmed}`;
      } else if (/^https?:\/\//i.test(trimmed)) {
        url = trimmed;
      } else {
        url = `https://${trimmed}`;
      }

      window.open(url, '_blank', 'noopener,noreferrer');
    }

    return (
      <Tooltip delayDuration={3000}>
        <Tooltip.Trigger asChild>
          <fieldset className="space-y-2" onDoubleClick={handleNavigate}>
            <Label asChild>
              <legend>{label}</legend>
            </Label>
            <div className="relative">
              <Button
                variant={'ghost'}
                className="absolute inset-0 size-8 flex items-center justify-center text-muted-foreground bg-muted rounded-l-sm rounded-r-none"
              >
                {InputIcon ? <InputIcon size={16} /> : <IconLink size={16} />}
              </Button>
              <Input
                id={inputId}
                className={cn(props.className, 'pl-9')}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                value={editingValue}
              />
            </div>
          </fieldset>
        </Tooltip.Trigger>
        <Tooltip.Content
          alignOffset={1}
          className="flex flex-row gap-2 items-center"
        >
          <IconLink size={12} />
          Double click to visit
        </Tooltip.Content>
      </Tooltip>
    );
  },
);
