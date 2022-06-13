import * as dayjs from 'dayjs';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { ISafeRemaItem } from '../types';
import { FinanceAmount } from '../../styles';

type Props = {
  item: ISafeRemaItem;
  // remove: (_id: string) => void;
};

type State = {
  remainder: number;
  diff: number;
};

class Row extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      remainder: props.item.count,
      diff: props.item.count - props.item.preCount
    };
  }

  displayNumber = value => {
    return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  onChangeCheck() {}

  onChangeRemainder = e => {
    e.preventDefault();
    const value = Number(e.target.value);
    this.setState({ remainder: value, diff: value - this.props.item.preCount });
  };

  onChangeDiff = e => {
    e.preventDefault();
    const value = Number(e.target.value);
    this.setState({ diff: value, remainder: value + this.props.item.preCount });
  };

  renderDate(date) {
    if (!date) {
      return null;
    }

    return dayjs(date).format('lll');
  }

  render() {
    const { item } = this.props;
    const { product, modifiedAt, count, preCount, uom, status } = item;
    const { diff, remainder } = this.state;

    return (
      <tr>
        <td>{product && `${product.code} - ${product.name}`}</td>

        <td>{this.renderDate(modifiedAt)}</td>
        <td>
          <FinanceAmount>{this.displayNumber(preCount)}</FinanceAmount>
        </td>
        <td>{uom && uom.name}</td>

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
            value={remainder}
            onChange={this.onChangeRemainder}
            align={'right'}
          />
        </td>
        <td>
          <FormControl
            type="number"
            value={diff}
            onChange={this.onChangeDiff}
            align={'right'}
          />
        </td>
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
