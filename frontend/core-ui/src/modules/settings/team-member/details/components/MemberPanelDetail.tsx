import { PanelAvatarField } from '@/side-panel/components/details/PanelAvatarField';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { IUserDetailsType } from '@/settings/team-member/types';
import {
  Avatar,
  DatePicker,
  Input,
  PhoneInput,
  readImage,
  ScrollArea,
  Textarea,
  toast,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currentUserState, PanelField, PrintDocument } from 'ui-modules';

type TUserDetails = IUserDetailsType & { __typename?: string };

type TDetailCode = 'firstName' | 'middleName' | 'lastName' | 'shortName';

type TDetailsChange = {
  [K in keyof IUserDetailsType]?: IUserDetailsType[K] | null;
};

export const MemberPanelTextField = ({
  value,
  placeholder,
  disabled,
  onSave,
}: {
  value: string;
  placeholder: string;
  disabled?: boolean;
  onSave: (value: string) => void;
}) => {
  const [editingValue, setEditingValue] = useState(value);

  useEffect(() => {
    setEditingValue(value);
  }, [value]);

  return (
    <Input
      value={editingValue}
      placeholder={placeholder}
      disabled={disabled}
      className="h-8 rounded-sm text-sm shadow-xs"
      onChange={(event) => setEditingValue(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          setEditingValue(value);
        }
      }}
      onBlur={() => {
        if (editingValue !== value) {
          onSave(editingValue);
        }
      }}
    />
  );
};

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
  const saved = value ? new Date(value) : undefined;

  return (
    <DatePicker
      value={saved}
      defaultMonth={saved}
      variant="outline"
      mode="single"
      placeholder="YYYY-MM-DD"
      className="h-8 w-full rounded-sm text-sm"
      popoverContentProps={{
        onOpenAutoFocus: (event) => event.preventDefault(),
      }}
      onChange={(next) => {
        const date = (next as Date | undefined) || undefined;

        if (date?.getTime() !== saved?.getTime()) {
          onSave(date || null);
        }
      }}
    />
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
  const [phone, setPhone] = useState(value);
  const [isValid, setIsValid] = useState(true);

  const save = () => {
    const normalized = phone.replace(/\D/g, '');

    if (normalized === value) {
      return;
    }

    if (normalized && !isValid) {
      toast({ title: t('invalid-phone-number'), variant: 'destructive' });
      return;
    }

    onSave(normalized || null);
  };

  return (
    <PhoneInput
      value={phone}
      className="h-8 bg-transparent text-sm"
      onChange={(next) => setPhone(next)}
      onEnter={save}
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setPhone(value);
        }
      }}
      onValidationChange={setIsValid}
    />
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
        className="min-h-20 rounded-sm text-sm shadow-xs"
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
    <PanelField label={label} cell={false}>
      <MemberPanelTextField
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
        <div className="py-2">
          <PrintDocument items={[{ _id }]} contentType="core:user" />
        </div>
        {renderDetailField('firstName', nameT('first-name', 'First name'))}
        {renderDetailField('middleName', nameT('middle-name', 'Middle name'))}
        {renderDetailField('lastName', nameT('last-name', 'Last name'))}
        {renderDetailField('shortName', t('short-name'))}
        <PanelField label={t('email')} cell={false}>
          <MemberPanelTextField
            value={email || ''}
            placeholder={t('add-primary-email')}
            onSave={(next) => usersEdit({ variables: { _id, email: next } })}
          />
        </PanelField>
        <PanelField label={t('phone')} cell={false}>
          <MemberPhoneField
            value={details?.operatorPhone || ''}
            onSave={(operatorPhone) => editDetails({ operatorPhone })}
          />
        </PanelField>
        <PanelField label={t('username')} cell={false}>
          <MemberPanelTextField
            value={username || ''}
            placeholder={t('username')}
            onSave={(next) => usersEdit({ variables: { _id, username: next } })}
          />
        </PanelField>
        <PanelField label={t('birthday')} cell={false}>
          <MemberDateField
            value={details?.birthDate}
            onSave={(birthDate) => editDetails({ birthDate })}
          />
        </PanelField>
        <PanelField label={t('joined-date')} cell={false}>
          <MemberDateField
            value={details?.workStartedDate}
            onSave={(workStartedDate) => editDetails({ workStartedDate })}
          />
        </PanelField>
        <PanelField label={t('score')} cell={false}>
          <MemberPanelTextField
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
