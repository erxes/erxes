import React from 'react';
import { FormControl } from '@erxes/ui/src/components';
import { IDayPlan, IPlanValue } from '../types';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import moment from 'moment';
import { ITimeframe } from '../../settings/types';

type Props = {
  dayPlan: IDayPlan;
  history: any;
  isChecked: boolean;
  timeFrames: ITimeframe[];
  toggleBulk: (dayPlan: IDayPlan, isChecked?: boolean) => void;
  edit: (doc: IDayPlan) => void;
};

type State = {
  values: IPlanValue[];
};

class Row extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props: Props) {
    super(props);

    this.state = {
      values: props.dayPlan.values || []
    };
  }

  onChangeValue = e => {
    const { edit, dayPlan } = this.props;
    const { values } = this.state;
    const count = e.target.value;
    const timeId = e.target.name;

    const ind = values.findIndex(v => v.timeId === timeId);
    values[ind].count = count;
    this.setState({ values }, () => {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => {
        edit({ _id: dayPlan._id, values });
      }, 1000);
    });
  };

  render() {
    const { dayPlan, toggleBulk, isChecked, timeFrames } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(dayPlan, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const { _id, date, branch, department, product, uom, planCount } = dayPlan;
    const { values } = this.state;

    const sumValue =
      Object.values(values).reduce(
        (sum, i) => Number(sum) + Number(i.count),
        0
      ) || 0;
    const diff = sumValue - (planCount || 0);
    const valueById = {};
    for (const val of values) {
      valueById[val.timeId] = val;
    }

    return (
      <tr key={_id} id={_id}>
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
        <td>{(planCount || 0).toLocaleString()}</td>
        {(timeFrames || []).map(tf => (
          <td key={tf._id}>
            <FormControl
              type="number"
              name={tf._id}
              defaultValue={(valueById[tf._id || ''] || {}).count || 0}
              onChange={this.onChangeValue}
            />
          </td>
        ))}
        <td>{sumValue.toLocaleString()}</td>
        <td>{diff.toLocaleString()}</td>
        <td>
          <ActionButtons>
            <Tip text={__('Text')} placement="bottom">
              <Button id="action-button" btnStyle="link">
                <Icon icon="pen-1" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
        {(
          values.filter(v => !timeFrames.map(t => t._id).includes(v.timeId)) ||
          []
        ).map(val => (
          <td key={val._id}>
            <FormControl
              type="number"
              name={val.timeId}
              defaultValue={(valueById[val.timeId || ''] || {}).count || 0}
              onChange={this.onChangeValue}
            />
          </td>
        ))}
      </tr>
    );
  }
}

export default Row;
