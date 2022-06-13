import React from 'react';
import { ISafeRemaItem } from '../types';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import FormControl from '@erxes/ui/src/components/form/Control';

type Props = {
  item: ISafeRemaItem;
  // remove: (_id: string) => void;
};

class Row extends React.Component<Props> {
  onChangeCheck() {}
  render() {
    const { item } = this.props;
    const { product, modifiedAt, count, status } = item;

    return (
      <tr>
        <td>{product && `${product.code} - ${product.name}`}</td>
        <td>{modifiedAt}</td>
        <td>{count}</td>
        <td>
          <FormControl
            checked={status}
            componentClass="checkbox"
            onChange={this.onChangeCheck}
          />
        </td>
        <td>
          <FormControl
            type="number"
            checked={status}
            onChange={this.onChangeCheck}
            align={'right'}
          />
        </td>
        <td>{count}</td>
        <td>{count}</td>
        <td>{count}</td>
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
