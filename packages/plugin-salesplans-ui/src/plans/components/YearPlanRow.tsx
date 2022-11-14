import Label from '@erxes/ui/src/components/Label';
import React from 'react';
import { FormControl, TextInfo } from '@erxes/ui/src/components';
import { IYearPlan } from '../types';
import { MONTHS } from '../../constants';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  yearPlan: IYearPlan;
  history: any;
  isChecked: boolean;
  toggleBulk: (yearPlan: IYearPlan, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  render() {
    const { yearPlan, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(yearPlan, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const { _id, year, branch, department, product, uom, values } = yearPlan;

    return (
      <tr key={_id}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{year}</td>
        <td>{branch ? `${branch.code} - ${branch.title}` : ''}</td>
        <td>{department ? `${department.code} - ${department.title}` : ''}</td>
        <td>{product ? `${product.code} - ${product.name}` : ''}</td>
        <td>{uom ? `${uom.code} - ${uom.name}` : ''}</td>
        {MONTHS.map(m => (
          <td key={m}>
            <FormControl
              type="number"
              defaultValue={values[m] || 0}
              onChange={onChange}
            />
          </td>
        ))}
        <td>
          {Object.values(values).reduce((sum, i) => Number(sum) + Number(i), 0)}
        </td>
        <td>
          <ActionButtons>
            <Tip text={__('Remove')} placement="bottom">
              <Button id="duplicate-box-line" btnStyle="link">
                <Icon icon="copy-1" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
