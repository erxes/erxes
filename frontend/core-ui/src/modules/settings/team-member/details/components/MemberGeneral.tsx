import { DetailsField } from './fields/DetailsField';
import { PhoneFieldUser } from './fields/PhoneFieldUser';
import { TextFieldUserDetail } from './fields/TextFieldUserDetail';
import { TextareaField } from './fields/TextareaField';
import { UserDateField } from './fields/UserDateField';
import { useUserDetail } from '../../hooks/useUserDetail';
import { Label } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const MemberGeneral = () => {
  const { t } = useTranslation('settings');
  const { userDetail } = useUserDetail();
  if (!userDetail) return;

  const { _id, details, email, score, username } = userDetail || {};
  return (
    <>
      <div className="py-8 space-y-6">
        <div className="px-8 font-medium flex gap-5 flex-col">
          <div className="grid grid-cols-2 gap-5 col-span-5">
            <DataListItem label={t('profile.email', 'Email')}>
              <TextFieldUserDetail
                value={email || ''}
                placeholder={t('team-member.add-primary-email', 'Add Primary Email')}
                field="email"
                _id={_id}
              />
            </DataListItem>
            <DataListItem label={t('phone-number', 'Phone')}>
              <PhoneFieldUser _id={_id} details={details} />
            </DataListItem>
            <DataListItem label={t('profile.username', 'Username')}>
              <TextFieldUserDetail
                value={username || ''}
                placeholder={t('profile.username-placeholder', 'Username')}
                field="username"
                _id={_id}
              />
            </DataListItem>
            <DataListItem label={t('profile.short-name', 'Short name')}>
              <DetailsField
                value={details?.shortName || ''}
                placeholder={t('profile.short-name', 'Short name')}
                field="shortName"
                _id={_id}
                details={details}
              />
            </DataListItem>
            <DataListItem label={t('team-member.birthday', 'Birthday')}>
              <UserDateField
                value={details?.birthDate}
                placeholder={t('profile.birth-date', 'Birth date')}
                field="birthDate"
                _id={_id}
                details={details}
              />
            </DataListItem>
            <DataListItem label={t('team-member.score', 'Score')}>
              <TextFieldUserDetail
                value={score ?? ''}
                placeholder={t('team-member.add-score', 'Add Score')}
                field="score"
                _id={_id}
                type="number"
              />
            </DataListItem>
          </div>

          <div className="grid grid-cols-2">
            <div className="space-y-2">
              <Label>{t('team-member.joined-date', 'Joined date')}</Label>
              <UserDateField
                value={details?.workStartedDate || ''}
                field="workStartedDate"
                className="w-full"
                details={details || {}}
                _id={_id}
              />
            </div>
          </div>

          <DataListItem label={t('description', 'Description')}>
            <TextareaField
              _id={_id}
              field="description"
              value={details?.description}
              details={details}
            />
          </DataListItem>
        </div>
      </div>
    </>
  );
};

const DataListItem = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <fieldset className="space-y-2">
      <Label asChild>
        <legend>{label}</legend>
      </Label>
      {children}
    </fieldset>
  );
};
