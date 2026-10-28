import { PanelAvatarField } from '@/side-panel/components/details/PanelAvatarField';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { IUserDetailsType } from '@/settings/team-member/types';
import { format } from 'date-fns';
import {
  Avatar,
  DatePicker,
  formatPhoneNumber,
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

type TUserDetails = IUserDetailsType & { __typename?: string };

type TDetailCode = 'firstName' | 'middleName' | 'lastName' | 'shortName';

type TDetailsChange = {
  [K in keyof IUserDetailsType]?: IUserDetailsType[K] | null;
};

export const MemberPanelTextField = ({
  scope,
  value,
  placeholder,
  disabled,
  onSave,
}: {
  scope: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  onSave: (value: string) => void;
}) => (
  <TextField
    scope={`${SCOPE}.${scope}`}
    value={value}
    placeholder={placeholder}
    className={PANEL_TEXT_FIELD_CLASS_NAME}
    disabled={disabled}
    onSave={onSave}
  >
    {!value && (
      <span className="shrink-0 text-muted-foreground">{placeholder}</span>
    )}
  </TextField>
);

const useMemberDetailsEdit = (_id: string, details?: TUserDetails) => {
  const { usersEdit } = useUserEdit();

  return (changed: TDetailsChange) => {
    const current: Partial<TUserDetails> = { ...details };
    delete current.__typename;
    usersEdit({ variables: { _id, details: { ...current, ...changed } } });
  };
};

const MemberDateField = ({
  value,
  onSave,
}: {
  value?: Date | string;
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
        if (!next && date?.getTime() !== saved?.getTime()) {
          onSave(date || null);
        }
      }}
    >
      <PanelFieldTrigger>
        {date ? (
          format(date, 'yyyy/MM/dd')
        ) : (
          <span className="text-muted-foreground">YYYY/MM/DD</span>
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

    if (normalized === value) {
      return;
    }

    if (normalized && !isValid) {
      toast({ title: t('invalid-phone-number'), variant: 'destructive' });
      setPhone(value);
      return;
    }

    onSave(normalized || null);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setPhone(value);
        } else {
          save();
        }
      }}
    >
      <PanelFieldTrigger>
        {value ? (
          formatPhoneNumber({ value: `+${value}` })
        ) : (
          <span className="text-muted-foreground">{t('phone')}</span>
        )}
      </PanelFieldTrigger>
      <RecordTableInlineCell.Content>
        <PhoneInput
          value={phone}
          className="bg-background"
          onChange={(next) => setPhone(next)}
          onEnter={() => setOpen(false)}
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

  return (
    <div className="flex flex-col gap-1.5 pt-2">
      <span className="text-xs font-medium text-accent-foreground">
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
  const editDetails = useMemberDetailsEdit(
    userDetail?._id || '',
    userDetail?.details,
  );

  if (!userDetail) {
    return null;
  }

  const { _id, details, email, username, score } = userDetail;
  const canEditProfile = !!currentUser?.isOwner;

  const renderDetailField = (code: TDetailCode, label: string) => (
    <PanelField label={label}>
      <MemberPanelTextField
        scope={code}
        value={details?.[code] || ''}
        placeholder={label}
        disabled={code !== 'shortName' && !canEditProfile}
        onSave={(next) => editDetails({ [code]: next })}
      />
    </PanelField>
  );

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-2 p-3">
        {canEditProfile ? (
          <PanelAvatarField
            value={details?.avatar || ''}
            onSave={(avatar) => editDetails({ avatar })}
          />
        ) : (
          <PanelField label={nameT('avatar', 'Avatar')} cell={false}>
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
        {renderDetailField('firstName', nameT('first-name', 'First name'))}
        {renderDetailField('middleName', nameT('middle-name', 'Middle name'))}
        {renderDetailField('lastName', nameT('last-name', 'Last name'))}
        {renderDetailField('shortName', t('short-name'))}
        <PanelField label={t('email')}>
          <MemberPanelTextField
            scope="email"
            value={email || ''}
            placeholder={t('add-primary-email')}
            onSave={(next) => usersEdit({ variables: { _id, email: next } })}
          />
        </PanelField>
        <PanelField label={t('phone')}>
          <MemberPhoneField
            value={details?.operatorPhone || ''}
            onSave={(operatorPhone) => editDetails({ operatorPhone })}
          />
        </PanelField>
        <PanelField label={t('username')}>
          <MemberPanelTextField
            scope="username"
            value={username || ''}
            placeholder={t('username')}
            onSave={(next) => usersEdit({ variables: { _id, username: next } })}
          />
        </PanelField>
        <PanelField label={t('birthday')}>
          <MemberDateField
            value={details?.birthDate}
            onSave={(birthDate) => editDetails({ birthDate })}
          />
        </PanelField>
        <PanelField label={t('joined-date')}>
          <MemberDateField
            value={details?.workStartedDate}
            onSave={(workStartedDate) => editDetails({ workStartedDate })}
          />
        </PanelField>
        <PanelField label={t('score')}>
          <MemberPanelTextField
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
