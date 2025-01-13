import {
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  formatValue,
} from '@erxes/ui/src';
import React from 'react';
import _ from 'lodash';
import { __ } from 'coreui/utils';
import { ILoanResearch } from '../types';

type Props = {
  loanResearch: ILoanResearch;
  isChecked: boolean;
  toggleBulk: (transaction: ILoanResearch, isChecked?: boolean) => void;
};

function LoansResearchRow({ loanResearch, isChecked, toggleBulk }: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(loanResearch, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>

      <td key={'apiUrl'}>{(loanResearch && loanResearch.apiUrl) || ''} </td>
    </>
  );
}

export default LoansResearchRow;
