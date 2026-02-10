import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import {
  IUserDetail,
  IUserDetailsType,
  UsersHotKeyScope,
} from '@/settings/team-member/types';
import { IconTrash } from '@tabler/icons-react';
import {
  Avatar,
  Button,
  FullNameField,
  FullNameValue,
  Popover,
  readImage,
  Upload,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import React from 'react';
import { currentUserState } from 'ui-modules';
import { useUserEdit } from '../../hooks/useUserEdit';

export const MemberDetailGeneral = () => {
  const { userDetail } = useUserDetail();
  const { _id, details, email } = userDetail || {};
  const { firstName, lastName, middleName } = details || {};
  const { usersEdit } = useUserEdit();
  const currentUser = useAtomValue(currentUserState);

  const handleEditDetails = (
    changedDetails: Partial<IUserDetail['details']>,
  ) => {
    const { __typename, ...rest } = details || {};
    usersEdit({
      variables: {
        _id,
        details: {
          ...rest,
          ...changedDetails,
        },
      },
    });
  };

  const Trigger = currentUser?.isOwner ? Popover.Trigger : React.Fragment;

  return (
    <div className="py-5 px-8 flex flex-col gap-6">
      <div className="flex gap-3 items-center flex-col lg:flex-row ">
        <MemberDetailAvatar
          details={details}
          email={email || ''}
          handleEditDetails={handleEditDetails}
        />
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
                handleEditDetails({
                  firstName: _firstName,
                  lastName: _lastName,
                });
              }
            }}
          >
            <Trigger asChild>
              <Button variant="ghost" className="text-base font-semibold">
                <FullNameValue />
              </Button>
            </Trigger>
          </FullNameField>
        </div>
      </div>
    </div>
  );
};

export const MemberDetailAvatar = ({
  details,
  email,
  handleEditDetails,
}: {
  email: string;
  details?: IUserDetailsType;
  handleEditDetails: (changedDetails: Partial<IUserDetailsType>) => void;
}) => {
  const { avatar, firstName, lastName, operatorPhone } = details || {};
  const currentUser = useAtomValue(currentUserState);

  if (!currentUser?.isOwner) {
    return (
      <Avatar size="lg" className="h-12 w-12">
        <Avatar.Image src={readImage(avatar || '')} />
        <Avatar.Fallback>
          {(firstName || lastName || email || operatorPhone)?.charAt(0)}
        </Avatar.Fallback>
      </Avatar>
    );
  }

  return (
    <Upload.Root
      value={avatar || ''}
      onChange={(fileInfo: any) => {
        if (fileInfo.url !== avatar) {
          handleEditDetails({
            avatar: fileInfo?.url || '',
          });
        }
      }}
    >
      <div className="relative">
        <Upload.Preview />
        <Upload.RemoveButton
          className="absolute -top-2 -right-2 rounded-full"
          variant="outline"
          size="icon"
        >
          <IconTrash />
        </Upload.RemoveButton>
      </div>
    </Upload.Root>
  );
};
