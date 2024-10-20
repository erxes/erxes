import { ActionButton } from '@erxes/ui/src/components/ActionButtons';
import ContractTypeForm from '../containers/ContractTypeForm';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IContractType } from '../types';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import _ from 'lodash';
import { formatValue } from '@erxes/ui/src/utils';
import { useNavigate } from 'react-router-dom';

type Props = {
  contractType: IContractType;
  isChecked: boolean;
  toggleBulk: (contractType: IContractType, isChecked?: boolean) => void;
};

function displayValue(contractType, name) {
  const value = _.get(contractType, name);

  return formatValue(value);
}

function renderFormTrigger(
  trigger: React.ReactNode,
  contractType: IContractType
) {
  const content = (props) => (
    <ContractTypeForm {...props} contractType={contractType} />
  );

  return (
    <ModalTrigger
      title="Edit contract type"
      trigger={trigger}
      content={content}
      size="lg"
    />
  );
}

function renderEditAction(contractType: IContractType) {
  const trigger = (
    <ActionButton style={{ cursor: 'pointer' }}>
      <Icon icon="edit-1" />
    </ActionButton>
  );

  return renderFormTrigger(trigger, contractType);
}

function ContractTypeRow({ contractType, isChecked, toggleBulk }: Props) {
  const navigate = useNavigate();
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(contractType, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    navigate(`/erxes-plugin-loan/contract-type-details/${contractType._id}`);
  };

  return (
    <tr onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>

      <td key={'code'}>{contractType.code}</td>
      <td key={'name'}>{contractType.name}</td>
      <td key={'number'}>{displayValue(contractType, 'number')}</td>
      <td key={'vacancy'}>{displayValue(contractType, 'vacancy')}</td>
      <td key={'product'}>{`${contractType.product?.code || ''} - ${contractType.product?.name || ''}`}</td>

      <td onClick={onClick}>{renderEditAction(contractType)}</td>
    </tr>
  );
}

export default ContractTypeRow;