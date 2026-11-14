import { FullNameField, FullNameValue } from 'erxes-ui';
import { PanelFieldTrigger, usePermissionCheck } from 'ui-modules';
import { useCPUserEdit } from '@/contacts/client-portal-users/hooks/useCPUserEdit';
import { type ICPUser } from '@/contacts/client-portal-users/types/cpUser';

export const CPUserPanelName = ({
  user,
  fallbackTitle,
}: {
  user: ICPUser;
  fallbackTitle: string;
}) => {
  const { cpUserEdit } = useCPUserEdit();
  const { hasActionPermission } = usePermissionCheck();
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  if (!hasActionPermission('clientPortalManage'))
    return <span className="truncate px-1">{fallbackTitle}</span>;
  return (
    <FullNameField
      key={user._id}
      scope={`cp-user-panel.${user._id}.name`}
      firstName={firstName}
      lastName={lastName}
      onValueChange={(nextFirstName, nextLastName) => {
        if (nextFirstName !== firstName || nextLastName !== lastName) {
          cpUserEdit({
            variables: {
              _id: user._id,
              firstName: nextFirstName,
              lastName: nextLastName,
            },
          });
        }
      }}
    >
      <PanelFieldTrigger className="px-1 font-medium">
        {firstName || lastName ? <FullNameValue /> : fallbackTitle}
      </PanelFieldTrigger>
    </FullNameField>
  );
};
