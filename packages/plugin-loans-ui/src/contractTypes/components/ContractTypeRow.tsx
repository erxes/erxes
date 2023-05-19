import { Button, formatValue, FormControl, ModalTrigger } from '@erxes/ui/src';
import _ from 'lodash';
import React from 'react';

import ContractTypeForm from '../containers/ContractTypeForm';
import { IContractType } from '../types';

type Props = {
  contractType: IContractType;
  history: any;
  isChecked: boolean;
  toggleBulk: (contractType: IContractType, isChecked?: boolean) => void;
};

type State = {
  showModal: boolean;
};

function displayValue(contractType, name) {
  const value = _.get(contractType, name);

  return formatValue(value);
}

function renderFormTrigger(
  trigger: React.ReactNode,
  contractType: IContractType
) {
  const content = props => (
    <ContractTypeForm {...props} contractType={contractType} />
  );

  return (
    <ModalTrigger
      title="Edit contract type"
      trigger={trigger}
      content={content}
    />
  );
}

function renderEditAction(contractType: IContractType) {
  const trigger = <Button btnStyle="link" icon="edit-1" />;

  return renderFormTrigger(trigger, contractType);
}

function ContractTypeRow(
  { contractType, history, isChecked, toggleBulk }: Props,
  { showModal }: State
) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(contractType, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    history.push(
      `/erxes-plugin-loan/contract-type-details/${contractType._id}`
    );
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

      <td key={'code'}>{displayValue(contractType, 'code')}</td>
      <td key={'name'}>{displayValue(contractType, 'name')}</td>
      <td key={'number'}>{displayValue(contractType, 'number')}</td>
      <td key={'vacancy'}>{displayValue(contractType, 'vacancy')}</td>

      <td onClick={onClick}>{renderEditAction(contractType)}</td>
    </tr>
  );
}

export default ContractTypeRow;
