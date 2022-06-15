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
  updateItem: (_id: string, remainder: number, status: string) => void;
  // remove: (_id: string) => void;
};

type State = {
  status: string;
  remainder: number;
  diff: number;
};

class Row extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      status: 'new',
      remainder: props.item.count,
      diff: props.item.count - props.item.preCount
    };
  }

  displayNumber = value => {
    return (value || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  update = () => {
    console.log('qqqqqqqqqqqqqqqqqq');
    const { remainder, status } = this.state;
    const { updateItem, item } = this.props;

    updateItem(item._id, remainder, status);
  };

  onChangeCheck() {}

  onChangeRemainder = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    e.preventDefault();
    const value = Number(e.target.value);
    this.setState({ remainder: value, diff: value - this.props.item.preCount });

    this.timer = setTimeout(() => {
      this.update();
    }, 500);
  };

  onChangeDiff = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    e.preventDefault();
    const value = Number(e.target.value);
    this.setState({ diff: value, remainder: value + this.props.item.preCount });

    this.timer = setTimeout(() => {
      this.update();
    }, 500);
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
