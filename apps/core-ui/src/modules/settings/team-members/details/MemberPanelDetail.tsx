import type { User } from '@erxes/core-contract';
import {
  IconAlignLeft,
  IconAt,
  IconCalendar,
  IconCalendarPlus,
  IconId,
  IconMail,
  IconPhone,
  IconUser,
  type Icon,
} from '@tabler/icons-react';
import {
  cn,
  DatePicker,
  formatPhoneNumber,
  FullNameField,
  FullNameValue,
  PhoneInput,
  Popover,
  RecordTableInlineCell,
  ScrollArea,
  Textarea,
  TextField,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toYmd } from '~/components/inlineCells';
import { nameParts } from '../record/TeamMemberColumns';
import { formatMemberDate, ymdToDate } from '../record/TeamMemberInlineFields';
import { useMemberPermissions, useTeamMemberEdit } from '../useTeamMembers';
import { PANEL_TEXT_FIELD_CLASS_NAME, PanelField, PanelFieldTrigger } from './PanelField';

const SCOPE = 'team-member-panel';

/** Edits a member's name in the panel's top bar, as a customer's is edited. */
export const MemberPanelName = ({ user }: { user: User }) => {
  const edit = useTeamMemberEdit();
  const { firstName, lastName } = nameParts(user);

  return (
    <FullNameField
      key={user.id}
      scope={`${SCOPE}.${user.id}.name`}
      firstName={firstName}
      lastName={lastName}
      onValueChange={(nextFirstName, nextLastName) => {
        if (nextFirstName !== firstName || nextLastName !== lastName) {
          edit.mutate({
            id: user.id,
            firstName: nextFirstName || null,
            middleName: null,
            lastName: nextLastName || null,
          });
        }
      }}
    >
      <PanelFieldTrigger className="px-1 font-medium">
        <FullNameValue />
      </PanelFieldTrigger>
    </FullNameField>
  );
};

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
    scope={`${SCOPE}.${scope}`}
    value={value}
    placeholder={placeholder}
    className={cn(PANEL_TEXT_FIELD_CLASS_NAME, !value && 'text-muted-foreground')}
    disabled={disabled}
    onSave={onSave}
  >
    {!value && <FieldIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
  </TextField>
);

/** A `YYYY-MM-DD` date, picked in a popover and saved when it closes. */
const MemberDateField = ({
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
const MemberPhoneField = ({
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
          className="bg-background"
          onChange={(next) => setPhone(next)}
          onEnter={() => handleOpenChange(false)}
          onValidationChange={setIsValid}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

const MemberDescriptionField = ({
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
        className="min-h-20 rounded-sm text-xs shadow-none"
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

/** The overview tab (old `MemberPanelDetail`); score and data extensions are left out. */
export const MemberPanelDetail = ({ user }: { user: User }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const edit = useTeamMemberEdit();
  const permissions = useMemberPermissions(user);
  const { id } = user;
  const readOnly = !permissions?.canEdit;

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-2 p-3">
        <PanelField icon={IconUser} label={t('short-name')}>
          <MemberPanelTextField
            icon={IconUser}
            scope={`${id}.shortName`}
            value={user.shortName ?? ''}
            placeholder={t('short-name')}
            disabled={readOnly}
            onSave={(shortName) => edit.mutate({ id, shortName: shortName || null })}
          />
        </PanelField>
        <PanelField icon={IconMail} label={t('email')}>
          <MemberPanelTextField
            icon={IconMail}
            scope={`${id}.email`}
            value={user.email}
            placeholder={t('add-primary-email')}
            disabled={!permissions?.canEditEmail}
            onSave={(email) => email.trim() && edit.mutate({ id, email: email.trim() })}
          />
        </PanelField>
        <PanelField icon={IconPhone} label={t('phone')}>
          <MemberPhoneField
            key={`${id}.${user.phone ?? ''}`}
            value={user.phone ?? ''}
            disabled={readOnly}
            onSave={(phone) => edit.mutate({ id, phone })}
          />
        </PanelField>
        <PanelField icon={IconAt} label={t('username')}>
          <MemberPanelTextField
            icon={IconAt}
            scope={`${id}.username`}
            value={user.username ?? ''}
            placeholder={t('username')}
            disabled={readOnly}
            onSave={(username) => username.trim() && edit.mutate({ id, username: username.trim() })}
          />
        </PanelField>
        <PanelField icon={IconId} label={t('employeeId')}>
          <MemberPanelTextField
            icon={IconId}
            scope={`${id}.employeeId`}
            value={user.employeeId ?? ''}
            placeholder={t('employeeId')}
            disabled={readOnly}
            onSave={(employeeId) => edit.mutate({ id, employeeId: employeeId || null })}
          />
        </PanelField>
        <PanelField icon={IconCalendar} label={t('birthday')}>
          <MemberDateField
            icon={IconCalendar}
            value={user.birthDate}
            disabled={readOnly}
            onSave={(birthDate) => edit.mutate({ id, birthDate })}
          />
        </PanelField>
        <PanelField icon={IconCalendarPlus} label={t('joined-date')}>
          <MemberDateField
            icon={IconCalendarPlus}
            value={user.workStartedDate}
            disabled={readOnly}
            onSave={(workStartedDate) => edit.mutate({ id, workStartedDate })}
          />
        </PanelField>
        <MemberDescriptionField
          value={user.description ?? ''}
          disabled={readOnly}
          onSave={(description) => edit.mutate({ id, description: description || null })}
        />
      </div>
    </ScrollArea>
  );
};
