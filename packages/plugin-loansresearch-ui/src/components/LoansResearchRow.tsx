import { FormControl } from '@erxes/ui/src';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';
import { ILoanResearch } from '../types';

type Props = {
  loansResearch: ILoanResearch;
  isChecked: boolean;
  toggleBulk: (transaction: ILoanResearch, isChecked?: boolean) => void;
};

function LoansResearchRow({ loansResearch, isChecked, toggleBulk }: Props) {
  const navigate = useNavigate();

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(loansResearch, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    navigate(`/loansresearch/details/${loansResearch._id}`);
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

      <td key={'dealId'}>{(loansResearch && loansResearch.dealId) || ''} </td>
    </tr>
  );
}

export default LoansResearchRow;
