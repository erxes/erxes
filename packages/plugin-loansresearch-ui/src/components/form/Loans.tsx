import {
  __,
  Button,
  ControlLabel,
  FormGroup,
  extractAttachment,
} from '@erxes/ui/src';
import { IAttachment } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import Select from 'react-select';

import { Uploader } from '@erxes/ui/src';
import { IIncome, ILoan, ILoanResearch } from '../../types';
import { CUSTOMER_TYPES, INCOME_TYPES } from '../../constants';
import { MarginTop } from '../../styles';

const getEmptyIncome = () => ({
  _id: Math.random().toString(),
  incomeType: '',
  files: [],
});

type Props = {
  loansResearch: ILoanResearch;
};

const LoanForm = (props: Props) => {
  const { loansResearch = {} as ILoanResearch } = props;

  const [currentTab, setCurrentTab] = useState('This session');
  const [attachment, setAttachment] = React.useState<IAttachment[] | undefined>(
    undefined
  );
  const [dealId, setDealId] = useState<string>(loansResearch?.dealId || '');
  const [customerType, setCustomerType] = useState<string>(
    loansResearch?.customerType || ''
  );
  const [customerId, setCustomerId] = useState<string>(
    loansResearch?.customerId || ''
  );
  const [debtIncomeRatio, setDebtIncomeRatio] = useState<number>(
    loansResearch?.debtIncomeRatio || 0
  );
  const [incomes, setIncomes] = React.useState<IIncome[]>([]);
  const [loans, setLoans] = React.useState<ILoan[]>([]);

  const onChangeDealId = (e) => {
    setDealId(e.target.value);
  };

  const onChangeCustomerId = (e) => {
    setCustomerId(e.target.value);
  };

  const onCustomerTypeChange = (option) => {
    setCustomerType(option.value);
  };

  const onChangeAttachmentMore = (files: IAttachment[]) => {
    setAttachment(files);
  };

  const onChangeFeature = () => {
    setIncomes([...incomes, getEmptyIncome()]);
  };

  const renderIncomeForm = () => {
    const attachment =
      (loansResearch.incomes &&
        extractAttachment(loansResearch.incomes.files)) ||
      [];

    return (
      <>
        {incomes.map((income, index) => {
          return (
            <>
              <FormGroup>
                <ControlLabel>Income type</ControlLabel>
                <Select
                  value={INCOME_TYPES.find(
                    (o) => o.value === incomes.incomeType
                  )}
                  onChange={onCustomerTypeChange}
                  options={INCOME_TYPES}
                  isClearable={false}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Secondary Images</ControlLabel>

                <Uploader
                  defaultFileList={attachment}
                  onChange={onChangeAttachmentMore}
                  multiple={true}
                  single={false}
                />
              </FormGroup>
            </>
          );
        })}
      </>
    );
  };

  const renderLoanForm = () => {
    return (
      <>
        <FormGroup>
          <ControlLabel>Loan type</ControlLabel>
          <Select
            value={CUSTOMER_TYPES.find((o) => o.value === customerType)}
            onChange={onCustomerTypeChange}
            options={CUSTOMER_TYPES}
            isClearable={false}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Secondary Images</ControlLabel>

          <Uploader
            defaultFileList={attachment}
            onChange={onChangeAttachmentMore}
            multiple={true}
            single={false}
          />
        </FormGroup>
      </>
    );
  };

  return (
    <MarginTop>
      <FormGroup>
        <ControlLabel>Loans</ControlLabel>
        <Button size="small">+ Add Loans</Button>
      </FormGroup>

      {renderLoanForm()}
    </MarginTop>
  );
};

export default LoanForm;
