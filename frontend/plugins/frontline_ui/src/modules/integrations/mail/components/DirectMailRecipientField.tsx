import { IconChevronDown, IconMail } from '@tabler/icons-react';
import { Button, Combobox, Command, Popover } from 'erxes-ui';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDirectMailComposerFields } from '@/integrations/mail/hooks/useDirectMailComposerFields';
import type { ComposeValues } from '@/integrations/mail/types/directMailComposer';

const VerifiedEmailSelect = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { emails } = useDirectMailComposerFields();
  const options = [...new Set([value, ...emails])].filter(Boolean);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 min-w-0 justify-between px-0 font-normal hover:bg-transparent"
          aria-label="Select recipient"
        >
          <span className="truncate">{value}</span>
          <IconChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        className="w-[min(24rem,calc(100vw-2rem))] p-0"
      >
        <Command>
          <Command.Input placeholder="Search contact emails" focusOnMount />
          <Command.List className="max-h-64 overflow-y-auto">
            <Combobox.Empty />
            {options.map((email) => (
              <Command.Item
                key={email}
                value={email}
                onSelect={() => {
                  onValueChange(email);
                  setOpen(false);
                }}
              >
                <IconMail className="size-4 text-muted-foreground" />
                <span className="truncate">{email}</span>
                <Combobox.Check checked={email === value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};

export const ToRow = () => {
  const { t } = useTranslation('frontline');
  const { showCc, showBcc, openCc, openBcc } = useDirectMailComposerFields();
  const {
    control,
    formState: { errors },
  } = useFormContext<ComposeValues>();

  return (
    <div className="grid flex-none grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center border-b px-4 py-1.5">
      <label className="text-xs text-muted-foreground" htmlFor="direct-mail-to">
        To
      </label>
      <Controller
        name="to"
        control={control}
        render={({ field }) => (
          <VerifiedEmailSelect
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
      <div className="flex items-center gap-1">
        {!showCc && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={openCc}
          >
            {t('cc')}
          </Button>
        )}
        {!showBcc && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={openBcc}
          >
            {t('bcc')}
          </Button>
        )}
      </div>
      {errors.to && (
        <p className="col-start-2 col-span-2 text-xs text-destructive">
          {errors.to.message}
        </p>
      )}
    </div>
  );
};
