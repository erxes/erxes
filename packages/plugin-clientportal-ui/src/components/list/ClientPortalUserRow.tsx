import { FormControl } from '@erxes/ui/src/components/form';
import React from 'react';
import { IClientPortalUser } from '../../types';

type Props = {
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
    const { clientPortalUser, history, toggleBulk, isChecked } = this.props;

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

    const {
      firstName,
      lastName,
      username,
      email,
      code,
      companyName
    } = clientPortalUser;

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{firstName || companyName}</td>
        <td>{lastName}</td>
        <td>{username}</td>
        <td>{email}</td>
        <td>{code}</td>
      </tr>
    );
  }
}

export default Row;
