import {
  ActionButtons,
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  __,
} from '@erxes/ui/src';
import React from 'react';
import _ from 'lodash';
import { ILoanResearch } from '../types';
import LoansResearchForm from '../containers/LoansResearchForm';

type Props = {
  loansResearch: ILoanResearch;
  isChecked: boolean;
  toggleBulk: (transaction: ILoanResearch, isChecked?: boolean) => void;
};

function LoansResearchRow({ loansResearch, isChecked, toggleBulk }: Props) {
  const trigger = (
    <Button btnStyle="link">
      <Tip text={__('Edit')} placement="bottom">
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  const content = (props) => (
    <LoansResearchForm {...props} loansResearch={loansResearch} />
  );

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(loansResearch, e.target.checked);
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

      <td key={'dealId'}>{(loansResearch && loansResearch?.dealId) || ''} </td>
      <td key={'customerType'}>
        {(loansResearch && loansResearch?.customerType) || ''}{' '}
      </td>
      <td key={'debtIncomeRatio'}>
        {(loansResearch && loansResearch?.debtIncomeRatio) || ''}{' '}
      </td>
      <td key={'increaseMonthlyPaymentAmount'}>
        {(loansResearch && loansResearch?.increaseMonthlyPaymentAmount) || ''}{' '}
      </td>

      <td onClick={onClick}>
        <ActionButtons>
          <ModalTrigger
            title="Edit basic info"
            trigger={trigger}
            size="xl"
            content={content}
          />
        </ActionButtons>
      </td>
    </tr>
  );
}

export default LoansResearchRow;
