import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import { renderUserFullName } from '@erxes/ui/src/utils/core';
import React from 'react';
import { ISafeRemainder } from '../types';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  remainder: ISafeRemainder;
  history: any;
  removeRemainder: (remainder: ISafeRemainder) => void;
};

class Row extends React.Component<Props> {
  remove = () => {
    const { removeRemainder, remainder } = this.props;

    removeRemainder(remainder);
  };

  render() {
    const { remainder, history } = this.props;
    const {
      date,
      modifiedAt,
      branch,
      department,
      productCategory,
      description,
      status,
      modifiedUser
    } = remainder;

    const onClick = e => {
      e.stopPropagation();
    };

    const onTrClick = () => {
      history.push(`/inventories/safe-remainders/details/${remainder._id}`);
    };

    return (
      <tr onClick={onTrClick}>
        <td>{date}</td>
        <td>{branch ? branch.title : ''}</td>
        <td>{department ? department.title : ''}</td>
        <td>
          {productCategory
            ? `${productCategory.code} - ${productCategory.name}`
            : ''}
        </td>
        <td>{description}</td>
        <td>{status}</td>
        <td>{modifiedAt}</td>
        <td>{renderUserFullName(modifiedUser || {})}</td>
        <td onClick={onClick}>
          <ActionButtons>
            <Tip text="Delete" placement="top">
              <Button
                btnStyle="link"
                onClick={this.remove}
                icon="times-circle"
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
