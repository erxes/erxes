import { type Icon, IconAlignLeft, IconPhone } from '@tabler/icons-react';
import {
  DatePicker,
  formatPhoneNumber,
  PhoneInput,
  Popover,
  RecordTableInlineCell,
  Textarea,
  TextField,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toYmd } from '~/components/inlineCells';
import { formatMemberDate, ymdToDate } from '../record/TeamMemberInlineFields';
import { PanelFieldTrigger } from './PanelField';

export const MEMBER_PANEL_SCOPE = 'team-member-panel';

export const MemberPanelTextField = ({
  scope,
  icon: FieldIcon,
  value,
  placeholder,
  disabled,
  onSave,
}: {
  scope: string;
  icon: Icon;
  value: string;
  placeholder: string;
  disabled?: boolean;
  onSave: (value: string) => void;
}) => (
  <TextField
    scope={`${MEMBER_PANEL_SCOPE}.${scope}`}
    value={value}
    placeholder={placeholder}
    variant="field"
    disabled={disabled}
    onSave={onSave}
  >
    {!value && <FieldIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
  </TextField>
);

/** A `YYYY-MM-DD` date, picked in a popover and saved when it closes. */
export const MemberDateField = ({
  value,
  icon: FieldIcon,
  disabled,
  onSave,
}: {
  value: string | null;
  icon: Icon;
  disabled?: boolean;
  onSave: (date: string | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(value);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (next) setDate(value);
        else if (date !== value) onSave(date);
      }}
    >
      <PanelFieldTrigger disabled={disabled}>
        {value ? (
          formatMemberDate(value)
        ) : (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <FieldIcon className="size-3.5 shrink-0" aria-hidden="true" />
            YYYY/MM/DD
          </span>
        )}
      </PanelFieldTrigger>
      <RecordTableInlineCell.Content className="w-auto">
        <DatePicker
          defaultMonth={date ? ymdToDate(date) : undefined}
          value={date ? ymdToDate(date) : undefined}
          onChange={(next) => setDate(next instanceof Date ? toYmd(next) : null)}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

/** Stored as `+<digits>`. */
export const MemberPhoneField = ({
  value,
  disabled,
  onSave,
}: {
  value: string;
  disabled?: boolean;
  onSave: (phone: string | null) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(value);
  const [isValid, setIsValid] = useState(true);

  const save = () => {
    const digits = phone.replace(/\D/g, '');

    if (digits === value.replace(/\D/g, '')) return;

    if (digits && !isValid) {
      toast({ title: t('invalid-phone-number'), variant: 'destructive' });
      setPhone(value);

      return;
    }

    onSave(digits ? `+${digits}` : null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);

    if (next) setPhone(value);
    else save();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PanelFieldTrigger disabled={disabled}>
        {value ? (
          formatPhoneNumber({ value: value.startsWith('+') ? value : `+${value}` })
        ) : (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <IconPhone className="size-3.5 shrink-0" aria-hidden="true" />
            {t('phone')}
          </span>
        )}
      </PanelFieldTrigger>
      <RecordTableInlineCell.Content>
        <PhoneInput
          value={phone}
          onChange={(next) => setPhone(next)}
          onEnter={() => handleOpenChange(false)}
          onValidationChange={setIsValid}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

/** Saved on blur or Enter; Escape puts back the saved text. */
export const MemberDescriptionField = ({
  value,
  disabled,
  onSave,
}: {
  value: string;
  disabled?: boolean;
  onSave: (description: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [description, setDescription] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setDescription(value);
  }

  return (
    <div className="flex flex-col gap-1.5 pt-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
        <IconAlignLeft className="size-3.5 shrink-0" aria-hidden="true" />
        {t('description')}
      </span>
      <Textarea
        value={description}
        disabled={disabled}
        placeholder={t('description')}
        variant="flat"
        text="sm"
        className="min-h-20"
        onChange={(event) => setDescription(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setDescription(value);

          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        onBlur={() => {
          if (description !== value) onSave(description);
        }}
      />
    </div>
  );
};
