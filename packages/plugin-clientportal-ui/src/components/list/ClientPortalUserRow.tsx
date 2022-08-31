import { FormControl } from '@erxes/ui/src/components/form';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import Tip from '@erxes/ui/src/components/Tip';
import colors from '@erxes/ui/src/styles/colors';
import { formatValue } from '@erxes/ui/src/utils';
import React from 'react';

import { IClientPortalUser } from '../../types';

type Props = {
  index: number;
  clientPortalUser: IClientPortalUser;
  history: any;
  isChecked: boolean;
  toggleBulk: (
    clientPortalUser: IClientPortalUser,
    isChecked?: boolean
  ) => void;
};

class Row extends React.Component<Props> {
  render() {
    const {
      clientPortalUser,
      history,
      toggleBulk,
      isChecked,
      index
    } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(clientPortalUser, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const onTrClick = () => {
      if (clientPortalUser.type === 'customer') {
        return history.push(
          `/settings/client-portal/users/details/${clientPortalUser._id}`
        );
      }
      if (clientPortalUser.type === 'company') {
        return history.push(
          `/settings/client-portal/companies/details/${clientPortalUser._id}`
        );
      }
    };

    const renderStatus = (verified: boolean) => {
      return (
        <Tip
          text={`Status: ${verified ? 'verified' : 'not verified'}`}
          placement="top"
        >
          <Icon
            icon={verified ? 'shield-check' : 'shield-slash'}
            color={verified ? colors.colorCoreGreen : colors.colorCoreGray}
          />
        </Tip>
      );
    };

    const {
      firstName,
      lastName,
      username,
      email,
      phone,
      createdAt,
      code,
      companyName,
      clientPortal,
      type
    } = clientPortalUser;

    const status = clientPortalUser.isOnline ? 'online' : 'offline';

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{index.toString()}</td>
        <td>
          {renderStatus(clientPortalUser.isEmailVerified)}
          {email}
        </td>
        <td>
          {renderStatus(clientPortalUser.isPhoneVerified)}
          {phone}
        </td>
        <td>{username}</td>
        <td>{code}</td>
        <td>{firstName || companyName}</td>
        <td>{lastName}</td>
        <td>{type}</td>
        <td>{clientPortal.name}</td>
        <td>
          <Label
            key={clientPortalUser._id}
            lblColor={
              clientPortalUser.isOnline
                ? colors.colorCoreGreen
                : colors.colorCoreGray
            }
            ignoreTrans={true}
          >
            <span>{status}</span>
          </Label>
        </td>
        <td>{formatValue(clientPortalUser.sessionCount || 0)}</td>
        <td>{formatValue(clientPortalUser.lastSeenAt)}</td>
        <td>{formatValue(createdAt)}</td>
        <td>{formatValue(clientPortalUser.modifiedAt)}</td>
      </tr>
    );
  }
}

export default Row;
