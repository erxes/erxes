import Label from '@erxes/ui/src/components/Label';
import React from 'react';
import { FormControl } from '@erxes/ui/src/components';
import { IDayPlan, IPlanValue } from '../types';
import { MONTHS } from '../../constants';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import moment from 'moment';

type Props = {
  dayPlan: IDayPlan;
  history: any;
  isChecked: boolean;
  toggleBulk: (dayPlan: IDayPlan, isChecked?: boolean) => void;
  edit: (doc: IDayPlan) => void;
};

type State = {
  values: IPlanValue;
};

class Row extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props: Props) {
    super(props);

    this.state = {
      values: props.dayPlan.values || {}
    };
  }

  onChangeValue = e => {
    const { edit, dayPlan } = this.props;
    const { values } = this.state;
    const value = e.target.value;
    const name = e.target.name;

    const newValues = { ...values, [name]: value };
    this.setState({ values: newValues }, () => {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => {
        edit({ _id: dayPlan._id, values: newValues });
      }, 1000);
    });
  };

  render() {
    const { dayPlan, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(dayPlan, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const { _id, date, branch, department, product, uom } = dayPlan;
    const { values } = this.state;

    return (
      <tr key={_id}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{moment(date).format('YYYY/MM/DD')}</td>
        <td>{branch ? `${branch.code} - ${branch.title}` : ''}</td>
        <td>{department ? `${department.code} - ${department.title}` : ''}</td>
        <td>{product ? `${product.code} - ${product.name}` : ''}</td>
        <td>{uom ? `${uom.code} - ${uom.name}` : ''}</td>
        {MONTHS.map(m => (
          <td key={m}>
            <FormControl
              type="number"
              name={m}
              defaultValue={values[m] || 0}
              onChange={this.onChangeValue}
            />
          </td>
        ))}
        <td>
          {Object.values(values).reduce((sum, i) => Number(sum) + Number(i), 0)}
        </td>
        <td>
          <ActionButtons>
            <Tip text={__('Text')} placement="bottom">
              <Button id="action-button" btnStyle="link">
                <Icon icon="pen-1" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
