import { ActionButtons } from '@erxes/ui-settings/src/styles';
import { renderUserFullName } from '@erxes/ui/src/utils/core';
import React from 'react';
import { ISafeRemainder, ISafeRemaItem } from '../types';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  item: ISafeRemaItem;
  // remove: (_id: string) => void;
};

class Row extends React.Component<Props> {
  render() {
    const { item } = this.props;
    const { productId, modifiedAt } = item;

    return (
      <tr>
        <td>{productId}</td>
        <td>{modifiedAt}</td>
        <td>
          <ActionButtons>
            <Tip text="Delete" placement="top">
              <Button btnStyle="link">
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
