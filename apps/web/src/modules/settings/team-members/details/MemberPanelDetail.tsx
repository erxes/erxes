import type { User } from '@erxes/core-contract';
import {
  IconAt,
  IconCalendar,
  IconCalendarPlus,
  IconId,
  IconMail,
  IconPhone,
  IconUser,
} from '@tabler/icons-react';
import { FullNameField, FullNameValue, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { nameParts } from '../record/TeamMemberColumns';
import { useMemberPermissions, useTeamMemberEdit } from '../useTeamMembers';
import {
  MEMBER_PANEL_SCOPE,
  MemberDateField,
  MemberDescriptionField,
  MemberPanelTextField,
  MemberPhoneField,
} from './MemberFieldInputs';
import { PanelField, PanelFieldTrigger } from './PanelField';

/** Edits a member's name in the panel's top bar, as a customer's is edited. */
export const MemberPanelName = ({ user }: { user: User }) => {
  const edit = useTeamMemberEdit();
  const { firstName, lastName } = nameParts(user);

  return (
    <FullNameField
      key={user.id}
      scope={`${MEMBER_PANEL_SCOPE}.${user.id}.name`}
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
      <PanelFieldTrigger variant="title">
        <FullNameValue />
      </PanelFieldTrigger>
    </FullNameField>
  );
};

/** Short name, email, phone, username and employee id. */
const MemberContactFields = ({ user }: { user: User }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const edit = useTeamMemberEdit();
  const permissions = useMemberPermissions(user);
  const { id } = user;
  const readOnly = !permissions?.canEdit;

  return (
    <>
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
    </>
  );
};

/** The overview tab: the member's own fields, each edited in place. */
export const MemberPanelDetail = ({ user }: { user: User }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const edit = useTeamMemberEdit();
  const permissions = useMemberPermissions(user);
  const { id } = user;
  const readOnly = !permissions?.canEdit;

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-2 p-3">
        <MemberContactFields user={user} />
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
