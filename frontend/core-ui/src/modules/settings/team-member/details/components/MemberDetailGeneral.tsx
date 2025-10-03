import { IconDeviceMobileMessage, IconMessage } from '@tabler/icons-react';
import { IconMail } from '@tabler/icons-react';
import { IconPhone } from '@tabler/icons-react';
import { Avatar, Button, FullNameValue, Label, readImage } from 'erxes-ui';
import { FullNameField } from 'erxes-ui';
import { useUserEdit } from '../../hooks/useUserEdit';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import { UsersHotKeyScope } from '@/settings/team-member/types';
import { SelectBranches, SelectDepartments, SelectPositions } from 'ui-modules';

export const MemberDetailGeneral = () => {
  const { userDetail } = useUserDetail();
  const { _id, details, email } = userDetail || {};
  const { firstName, lastName, middleName, operatorPhone, avatar } =
    details || {};
  const { usersEdit } = useUserEdit();

  return (
    <div className="py-5 px-8 flex flex-col gap-6">
      <div className="flex gap-3 items-center flex-col lg:flex-row ">
        <Avatar size="lg" className="h-12 w-12">
          <Avatar.Image src={readImage(avatar || '')} />
          <Avatar.Fallback>
            {(firstName || lastName || email || operatorPhone)?.charAt(0)}
          </Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <FullNameField
            scope={UsersHotKeyScope.UserDetailPage + '.' + _id + '.Name'}
            firstName={firstName || ''}
            lastName={
              middleName
                ? `${middleName || ''} ${lastName || ''}`
                : lastName || ''
            }
            onValueChange={(_firstName, _lastName) => {
              if (_firstName !== firstName || _lastName !== lastName) {
                const { __typename, ...rest } = details || {};
                usersEdit({
                  variables: {
                    _id,
                    details: {
                      ...rest,
                      firstName: _firstName,
                      lastName: _lastName,
                    },
                  },
                });
              }
            }}
          >
            <Button variant="ghost" className="text-base font-semibold">
              <FullNameValue />
            </Button>
          </FullNameField>
        </div>
        {/* <div className="inline-flex rounded-lg bg-muted -space-x-px lg:ml-auto ">
          <Button
            variant="outline"
            className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 border font-semibold text-sm"
          >
            <IconMail />
            Email
          </Button>
          <Button
            variant="outline"
            className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 border font-semibold text-sm"
          >
            <IconMessage /> Message
          </Button>
          <Button
            variant="outline"
            className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 border font-semibold text-sm"
          >
            <IconDeviceMobileMessage /> SMS
          </Button>
          <Button
            variant="outline"
            className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 border font-semibold text-sm"
          >
            <IconPhone /> Call
          </Button>
        </div> */}
      </div>
      {/* <fieldset className="space-y-2">
        <Label asChild>
          <legend>Branches</legend>
        </Label>
        <SelectBranches.Detail
          value={userDetail?.branchIds}
          mode="multiple"
          onValueChange={(value) => {
            usersEdit({
              variables: {
                _id,
                branchIds: value,
              },
            });
          }}
        />
        <Label asChild>
          <legend>Departments</legend>
        </Label>
        <SelectDepartments.Detail
          value={userDetail?.departmentIds}
          mode="multiple"
          onValueChange={(value) => {
            usersEdit({
              variables: {
                _id,
                departmentIds: value,
              },
            });
          }}
        />
        <Label asChild>
          <legend>Positions</legend>
        </Label>
        <SelectPositions.Detail
          value={userDetail?.positionIds}
          mode="multiple"
          onValueChange={(value) => {
            usersEdit({
              variables: {
                _id,
                positionIds: value,
              },
            });
          }}
        />
      </fieldset> */}
    </div>
  );
};
