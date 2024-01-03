import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components';
import { IReserveRem } from '../types';

type Props = {
  reserveRem: IReserveRem;
  history: any;
  isChecked: boolean;
  toggleBulk: (reserveRem: IReserveRem, isChecked?: boolean) => void;
  edit: (doc: IReserveRem) => void;
};

type State = {
  remainder: number;
};

class Row extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props: Props) {
    super(props);

    this.state = {
      remainder: props.reserveRem.remainder || 0
    };
  }

  onChangeValue = e => {
    const { edit, reserveRem } = this.props;
    const value = e.target.value;

    this.setState({ remainder: value }, () => {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => {
        edit({ _id: reserveRem._id, remainder: Number(value) });
      }, 1000);
    });
  };

  render() {
    const { reserveRem, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(reserveRem, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const { _id, branch, department, remainder, product, uom } = reserveRem;
    return (
      <tr key={_id}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{branch ? `${branch.code} - ${branch.title}` : ''}</td>
        <td>{department ? `${department.code} - ${department.title}` : ''}</td>
        <td>{product ? `${product.code} - ${product.name}` : ''}</td>
        <td>{uom || ''}</td>
        <td>
          <FormControl
            type="number"
            name={'remainder'}
            defaultValue={remainder || 0}
            onChange={this.onChangeValue}
          />
        </td>
        <td>
          <ActionButtons>.</ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
