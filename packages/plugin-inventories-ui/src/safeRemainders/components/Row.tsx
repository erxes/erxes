import { ActionButtons } from '@erxes/ui-settings/src/styles';
import { renderUserFullName } from '@erxes/ui/src/utils/core';
import React from 'react';
import { ISafeRemainder } from '../types';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  remainder: ISafeRemainder;
  history: any;
  remove: (_id: string) => void;
};

class Row extends React.Component<Props> {
  render() {
    const { remainder } = this.props;
    const {
      date,
      modifiedAt,
      branch,
      department,
      description,
      status,
      modifiedUser,
      remove
    } = remainder;

    const onClick = () => {
      remove(remainder._id);
    };

    return (
      <tr>
        <td>{date}</td>
        <td>{branch ? branch.title : ''}</td>
        <td>{department ? department.title : ''}</td>
        <td>{description}</td>
        <td>{status}</td>
        <td>{modifiedAt.toDateString()}</td>
        <td>{renderUserFullName(modifiedUser)}</td>
        <td>
          <ActionButtons>
            <Tip text="Delete" placement="top">
              <Button btnStyle="link" onClick={onClick}>
                <Icon icon="times-circle" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
