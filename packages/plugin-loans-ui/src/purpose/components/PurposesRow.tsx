import { ActionButton } from '@erxes/ui/src/components/ActionButtons';
import ContractTypeForm from '../containers/PurposeForm';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IPurpose } from '../types';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import _ from 'lodash';

type Props = {
  purpose: IPurpose;
  purposes: IPurpose[];
  isChecked: boolean;
  toggleBulk: (purpose: IPurpose, isChecked?: boolean) => void;
};

function renderFormTrigger(
  trigger: React.ReactNode,
  purpose: IPurpose,
  purposes: IPurpose[]
) {
  const content = (props) => (
    <ContractTypeForm {...props} purpose={purpose} purposes={purposes} />
  );

  return (
    <ModalTrigger
      title="Edit contract type"
      trigger={trigger}
      content={content}
      size="xl"
    />
  );
}

function renderEditAction(purpose: IPurpose, purposes: IPurpose[]) {
  const trigger = (
    <ActionButton style={{ cursor: 'pointer' }}>
      <Icon icon="edit-1" />
    </ActionButton>
  );

  return renderFormTrigger(trigger, purpose, purposes);
}

function PurposesRow({ purpose, isChecked, toggleBulk, purposes }: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(purpose, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>

      <td key={'code'}>{purpose.code}</td>
      <td key={'name'}>{purpose.name}</td>

      <td onClick={onClick}>{renderEditAction(purpose, purposes)}</td>
    </tr>
  );
}

export default PurposesRow;
