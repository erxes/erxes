import { PanelAvatarField } from '@/side-panel/components/details/PanelAvatarField';
import {
  IconAlignLeft,
  IconAt,
  IconCalendar,
  IconCalendarPlus,
  IconMail,
  IconPhone,
  IconPhoto,
  IconStar,
  IconUser,
  type Icon,
} from '@tabler/icons-react';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import {
  useUserEdit,
  useUserObjectEdit,
} from '@/settings/team-member/hooks/useUserEdit';
import { format } from 'date-fns';
import {
  Avatar,
  cn,
  DatePicker,
  formatPhoneNumber,
  FullNameField,
  FullNameValue,
  PhoneInput,
  Popover,
  readImage,
  RecordTableInlineCell,
  ScrollArea,
  Textarea,
  TextField,
  toast,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  currentUserState,
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelField,
  PanelFieldTrigger,
} from 'ui-modules';

const SCOPE = 'team-member-panel';

/** Edits a member's name in the panel's top bar, as a customer's is edited. */
export const MemberPanelName = ({ userId }: { userId: string }) => {
  const { userDetail } = useUserDetail();
  const details = userDetail?.details;
  const editDetails = useUserObjectEdit(userId, 'details', details);
  const firstName = details?.firstName || '';
  const lastName = [details?.middleName, details?.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <FullNameField
      key={userId}
      scope={`${SCOPE}.${userId}.name`}
      firstName={firstName}
      lastName={lastName}
      onValueChange={(nextFirstName, nextLastName) => {
        if (nextFirstName !== firstName || nextLastName !== lastName) {
          editDetails({
            firstName: nextFirstName,
            middleName: '',
            lastName: nextLastName,
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
  icon: Icon,
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
    className={cn(
      PANEL_TEXT_FIELD_CLASS_NAME,
      !value && 'text-muted-foreground',
    )}
    disabled={disabled}
    onSave={onSave}
  >
    {!value && (
      <Icon
        className="size-3.5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    )}
  </TextField>
);

const MemberDateField = ({
  value,
  icon: Icon,
  onSave,
}: {
  value?: Date | string;
  icon: Icon;
  onSave: (date: Date | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const saved = value ? new Date(value) : undefined;
  const [date, setDate] = useState(saved);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setDate(saved);
        } else if (date?.getTime() !== saved?.getTime()) {
          onSave(date || null);
        }
      }}
    >
      <PanelFieldTrigger>
        {saved ? (
          format(saved, 'yyyy/MM/dd')
        ) : (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            YYYY/MM/DD
          </span>
        )}
      </PanelFieldTrigger>
      <RecordTableInlineCell.Content className="w-auto">
        <DatePicker
          defaultMonth={date}
          value={date}
          onChange={(next) => setDate(next as Date | undefined)}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

const MemberPhoneField = ({
  value,
  onSave,
}: {
  value: string;
  onSave: (phone: string | null) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(value);
  const [isValid, setIsValid] = useState(true);

  const save = () => {
    const normalized = phone.replace(/\D/g, '');

    if (normalized === value.replace(/\D/g, '')) {
      return;
    }

    if (normalized && !isValid) {
      toast({ title: t('invalid-phone-number'), variant: 'destructive' });
      setPhone(value);
      return;
    }

    onSave(normalized || null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setPhone(value);
    } else {
      save();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PanelFieldTrigger>
        {value ? (
          formatPhoneNumber({ value: `+${value}` })
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
  onSave,
}: {
  value: string;
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
        placeholder={t('description')}
        className="min-h-20 rounded-sm text-xs shadow-none"
        onChange={(event) => setDescription(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setDescription(value);
          }
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        onBlur={() => {
          if (description !== value) {
            onSave(description);
          }
        }}
      />
    </div>
  );
};

export const MemberPanelDetail = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { t: nameT } = useTranslation('contact', {
    keyPrefix: 'customer.add',
  });
  const { userDetail } = useUserDetail();
  const currentUser = useAtomValue(currentUserState);
  const { usersEdit } = useUserEdit();
  const editDetails = useUserObjectEdit(
    userDetail?._id || '',
    'details',
    userDetail?.details,
  );

  if (!userDetail) {
    return null;
  }

  const { _id, details, email, username, score } = userDetail;
  const canEditProfile = !!currentUser?.isOwner;

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-2 p-3">
        {canEditProfile ? (
          <PanelAvatarField
            value={details?.avatar || ''}
            onSave={(avatar) => editDetails({ avatar })}
          />
        ) : (
          <PanelField
            icon={IconPhoto}
            label={nameT('avatar', 'Avatar')}
            cell={false}
          >
            <div className="px-2 py-1">
              <Avatar size="lg" className="size-10">
                <Avatar.Image src={readImage(details?.avatar || '')} />
                <Avatar.Fallback>
                  {(details?.firstName || email || '').charAt(0)}
                </Avatar.Fallback>
              </Avatar>
            </div>
          </PanelField>
        )}
        <PanelField icon={IconUser} label={t('short-name')}>
          <MemberPanelTextField
            icon={IconUser}
            scope="shortName"
            value={details?.shortName || ''}
            placeholder={t('short-name')}
            onSave={(shortName) => editDetails({ shortName })}
          />
        </PanelField>
        <PanelField icon={IconMail} label={t('email')}>
          <MemberPanelTextField
            icon={IconMail}
            scope="email"
            value={email || ''}
            placeholder={t('add-primary-email')}
            onSave={(next) => usersEdit({ variables: { _id, email: next } })}
          />
        </PanelField>
        <PanelField icon={IconPhone} label={t('phone')}>
          <MemberPhoneField
            value={details?.operatorPhone || ''}
            onSave={(operatorPhone) => editDetails({ operatorPhone })}
          />
        </PanelField>
        <PanelField icon={IconAt} label={t('username')}>
          <MemberPanelTextField
            icon={IconAt}
            scope="username"
            value={username || ''}
            placeholder={t('username')}
            onSave={(next) => usersEdit({ variables: { _id, username: next } })}
          />
        </PanelField>
        <PanelField icon={IconCalendar} label={t('birthday')}>
          <MemberDateField
            icon={IconCalendar}
            value={details?.birthDate}
            onSave={(birthDate) => editDetails({ birthDate })}
          />
        </PanelField>
        <PanelField icon={IconCalendarPlus} label={t('joined-date')}>
          <MemberDateField
            icon={IconCalendarPlus}
            value={details?.workStartedDate}
            onSave={(workStartedDate) => editDetails({ workStartedDate })}
          />
        </PanelField>
        <PanelField icon={IconStar} label={t('score')}>
          <MemberPanelTextField
            icon={IconStar}
            scope="score"
            value={score === undefined || score === null ? '' : String(score)}
            placeholder={t('add-score')}
            onSave={(next) => {
              const nextScore = next.trim() === '' ? null : Number(next);

              if (Number.isNaN(nextScore)) {
                toast({ title: t('add-score'), variant: 'destructive' });
                return;
              }

              usersEdit({ variables: { _id, score: nextScore } });
            }}
          />
        </PanelField>
        <MemberDescriptionField
          value={details?.description || ''}
          onSave={(description) => editDetails({ description })}
        />
      </div>
    </ScrollArea>
  );
};
