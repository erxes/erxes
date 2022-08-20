import { Button, formatValue, FormControl, ModalTrigger } from '@erxes/ui/src';
import _ from 'lodash';
import React from 'react';

import AdjustmentForm from '../containers/AdjustmentForm';
import { IAdjustment } from '../types';

type Props = {
  adjustment: IAdjustment;
  history: any;
  isChecked: boolean;
  toggleBulk: (adjustment: IAdjustment, isChecked?: boolean) => void;
};

type State = {
  showModal: boolean;
};

function displayValue(adjustment, name) {
  const value = _.get(adjustment, name);

  return formatValue(value);
}

function renderFormTrigger(trigger: React.ReactNode, adjustment: IAdjustment) {
  const content = props => (
    <AdjustmentForm {...props} adjustment={adjustment} />
  );

  return (
    <ModalTrigger title="Edit adjustment" trigger={trigger} content={content} />
  );
}

function renderEditAction(adjustment: IAdjustment) {
  const trigger = <Button btnStyle="link" icon="edit-1" />;

  return renderFormTrigger(trigger, adjustment);
}

function AdjustmentRow(
  { adjustment, history, isChecked, toggleBulk }: Props,
  { showModal }: State
) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(adjustment, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    history.push(`/erxes-plugin-loan/adjustment-details/${adjustment._id}`);
  };

  return (
    <tr onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>

      <td key={'code'}>{displayValue(adjustment, 'date')}</td>

      <td onClick={onClick}>{renderEditAction(adjustment)}</td>
    </tr>
  );
}

export default AdjustmentRow;
