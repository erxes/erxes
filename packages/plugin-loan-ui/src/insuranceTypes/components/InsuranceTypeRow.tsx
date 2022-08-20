import { Button, formatValue, FormControl, ModalTrigger } from '@erxes/ui/src';
import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';

import InsuranceTypeForm from '../containers/InsuranceTypeForm';
import { IInsuranceType } from '../types';

type Props = {
  insuranceType: IInsuranceType;
  history: any;
  isChecked: boolean;
  toggleBulk: (insuranceType: IInsuranceType, isChecked?: boolean) => void;
};

type State = {
  showModal: boolean;
};

function displayValue(insuranceType, name) {
  const value = _.get(insuranceType, name);

  return formatValue(value);
}

function displayCompanyValue(insuranceType, company, name) {
  const value = _.get(company, name);
  return (
    <Link to={`/companies/details/${insuranceType.companyId}`}>
      {formatValue(value)}
    </Link>
  );
}

function renderFormTrigger(
  trigger: React.ReactNode,
  insuranceType: IInsuranceType
) {
  const content = props => (
    <InsuranceTypeForm {...props} insuranceType={insuranceType} />
  );

  return (
    <ModalTrigger
      title="Edit insurance type"
      trigger={trigger}
      content={content}
    />
  );
}

function renderEditAction(insuranceType: IInsuranceType) {
  const trigger = <Button btnStyle="link" icon="edit-1" />;

  return renderFormTrigger(trigger, insuranceType);
}

function InsuranceTypeRow(
  { insuranceType, history, isChecked, toggleBulk }: Props,
  { showModal }: State
) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(insuranceType, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>

      <td key={'code'}>{displayValue(insuranceType, 'code')}</td>
      <td key={'name'}>{displayValue(insuranceType, 'name')}</td>
      <td key={'companyCode'}>
        {displayCompanyValue(insuranceType, insuranceType.company, 'code')}
      </td>
      <td key={'companyName'}>
        {displayCompanyValue(
          insuranceType,
          insuranceType.company,
          'primaryName'
        )}
      </td>
      <td key={'percent'}>{displayValue(insuranceType, 'percent')}</td>
      <td key={'yearPercents'}>
        {displayValue(insuranceType, 'yearPercents')}
      </td>
      <td key={'description'}>{displayValue(insuranceType, 'description')}</td>
      <td>{renderEditAction(insuranceType)}</td>
    </tr>
  );
}

export default InsuranceTypeRow;
