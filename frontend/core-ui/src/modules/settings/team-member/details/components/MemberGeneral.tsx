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
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { userDetail } = useUserDetail();
  if (!userDetail) return;

  const { _id, details, email, score, username } = userDetail || {};
  return (
    <>
      <div className="py-8 space-y-6">
        <div className="px-8 font-medium flex gap-5 flex-col">
          <div className="grid grid-cols-2 gap-5 col-span-5">
            <DataListItem label={t('email')}>
              <TextFieldUserDetail
                value={email || ''}
                placeholder={t('add-primary-email')}
                field="email"
                _id={_id}
              />
            </DataListItem>
            <DataListItem label={t('phone')}>
              <PhoneFieldUser _id={_id} details={details} />
            </DataListItem>
            <DataListItem label={t('username')}>
              <TextFieldUserDetail
                value={username || ''}
                placeholder={t('username')}
                field="username"
                _id={_id}
              />
            </DataListItem>
            <DataListItem label={t('short-name')}>
              <DetailsField
                value={details?.shortName || ''}
                placeholder={t('short-name')}
                field="shortName"
                _id={_id}
                details={details}
              />
            </DataListItem>
            <DataListItem label={t('birthday')}>
              <UserDateField
                value={details?.birthDate}
                placeholder={t('birth-date')}
                field="birthDate"
                _id={_id}
                details={details}
              />
            </DataListItem>
            <DataListItem label={t('score')}>
              <TextFieldUserDetail
                value={score ?? ''}
                placeholder={t('add-score')}
                field="score"
                _id={_id}
                type="number"
              />
            </DataListItem>
          </div>

          <div className="grid grid-cols-2">
            <div className="space-y-2">
              <Label>{t('joined-date')}</Label>
              <UserDateField
                value={details?.workStartedDate || ''}
                field="workStartedDate"
                className="w-full"
                details={details || {}}
                _id={_id}
              />
            </div>
          </div>

          <DataListItem label={t('description')}>
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
