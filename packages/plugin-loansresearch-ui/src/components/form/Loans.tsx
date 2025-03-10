import {
  __,
  Button,
  ControlLabel,
  FormGroup,
  extractAttachment,
  FormControl,
} from '@erxes/ui/src';
import { IAttachment } from '@erxes/ui/src/types';
import React from 'react';
import Datetime from '@nateradebaugh/react-datetime';
import Select from 'react-select';

import { Uploader } from '@erxes/ui/src';
import { ILoan } from '../../types';
import { MarginTop } from '../../styles';
import { FormLabel } from '@erxes/ui/src/components/form/styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { FlexRow } from '../../styles';
import { LOAN_TYPES } from '../../constants';

const getEmptyIncome = () => ({
  _id: crypto.randomUUID(),
  startDate: '',
  closeDate: '',
  files: [],
});

type Props = {
  loans: ILoan[];
  setLoans: (loans) => void;
  monthlyCostAmount: number;
  monthlyLoanAmount: number;
  totalPaymentAmount: number;
};

const LoanForm = (props: Props) => {
  const {
    loans,
    setLoans,
    monthlyCostAmount,
    monthlyLoanAmount,
    totalPaymentAmount,
  } = props;

  const onChangeLoanItem = (_id: string, key: string, value: any) => {
    setLoans((prevLoans) =>
      prevLoans.map(
        (loan) =>
          loan._id === _id
            ? { ...loan, [key]: value } // Update the specific key
            : loan // Leave other loans unchanged
      )
    );
  };

  const onChangeAttachmentMore = (
    _id: string,
    key: string,
    files: IAttachment[]
  ) => {
    setLoans((prevLoans) =>
      prevLoans.map(
        (loan) =>
          loan._id === _id
            ? { ...loan, [key]: files } // Update the specific key
            : loan // Leave other loans unchanged
      )
    );
  };

  const onChangeDate = (_id: string, key: string, date: any) => {
    setLoans((prevLoans) =>
      prevLoans.map(
        (loan) =>
          loan._id === _id
            ? { ...loan, [key]: date } // Update the specific key
            : loan // Leave other loans unchanged
      )
    );
  };

  const onChangeFeature = () => {
    setLoans([...loans, getEmptyIncome()]);
  };

  const removeFeature = (_id?: string) => {
    const modifiedLoans = loans.filter((f) => f._id !== _id);

    setLoans(modifiedLoans);
  };

  const renderLoanForm = () => {
    return (
      <>
        {loans.map((loan) => {
          return (
            <MarginTop borderBottom={true}>
              <FormGroup>
                <ControlLabel>Income type</ControlLabel>
                <Select
                  value={LOAN_TYPES.find((o) => o.value === loan.loanType)}
                  onChange={(item: any) =>
                    onChangeLoanItem(loan._id, 'loanType', item.value)
                  }
                  options={LOAN_TYPES}
                  isClearable={false}
                />
              </FormGroup>

              {loan.loanType === 'Loan' && (
                <>
                  <FormGroup>
                    <ControlLabel>loan name</ControlLabel>
                    <FormControl
                      type="text"
                      defaultValue={loan?.loanName || ''}
                      onChange={(e: any) =>
                        onChangeLoanItem(loan._id, 'loanName', e.target.value)
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>loanLocation</ControlLabel>
                    <FormControl
                      type="text"
                      defaultValue={loan?.loanLocation || ''}
                      onChange={(e: any) =>
                        onChangeLoanItem(
                          loan._id,
                          'loanLocation',
                          e.target.value
                        )
                      }
                    />
                  </FormGroup>

                  <FlexRow>
                    <FormGroup>
                      <FormLabel>{__('Start Date')}</FormLabel>
                      <DateContainer>
                        <Datetime
                          dateFormat="MM/DD/YYYY"
                          closeOnSelect={true}
                          utc={true}
                          timeFormat={true}
                          defaultValue={loan?.startDate}
                          onChange={(e: any) =>
                            onChangeDate(loan._id, 'startDate', e.getTime())
                          }
                        />
                      </DateContainer>
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>{__('Close Date')}</FormLabel>
                      <DateContainer>
                        <Datetime
                          dateFormat="MM/DD/YYYY"
                          closeOnSelect={true}
                          utc={true}
                          timeFormat={true}
                          defaultValue={loan?.closeDate}
                          onChange={(e: any) =>
                            onChangeDate(loan._id, 'closeDate', e.getTime())
                          }
                        />
                      </DateContainer>
                    </FormGroup>
                  </FlexRow>
                  <FormGroup>
                    <ControlLabel>loan amount</ControlLabel>
                    <FormControl
                      type="number"
                      value={loan?.loanAmount || 0}
                      useNumberFormat={true}
                      fixed={2}
                      onChange={(e: any) =>
                        onChangeLoanItem(
                          loan._id,
                          'loanAmount',
                          Number(e.target.value)
                        )
                      }
                    />
                  </FormGroup>
                </>
              )}

              {loan.loanType === 'Cost' && (
                <>
                  <FormGroup>
                    <ControlLabel>cost name</ControlLabel>
                    <FormControl
                      type="text"
                      defaultValue={loan?.costName || ''}
                      onChange={(e: any) =>
                        onChangeLoanItem(loan._id, 'costName', e.target.value)
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>monthly cost amount</ControlLabel>
                    <FormControl
                      type="number"
                      value={loan?.costAmount || 0}
                      useNumberFormat={true}
                      fixed={2}
                      onChange={(e: any) =>
                        onChangeLoanItem(
                          loan._id,
                          'costAmount',
                          Number(e.target.value)
                        )
                      }
                    />
                  </FormGroup>
                </>
              )}

              <FormGroup>
                <ControlLabel>Files</ControlLabel>

                <Uploader
                  defaultFileList={
                    (loan.files && extractAttachment(loan.files)) || []
                  }
                  onChange={(files: any) =>
                    onChangeAttachmentMore(loan._id, 'files', files)
                  }
                  multiple={true}
                  single={false}
                />

                {loan.loanType === 'Cost' && (
                  <Button
                    btnStyle="danger"
                    onClick={() => removeFeature(loan._id)}
                  >
                    X
                  </Button>
                )}
              </FormGroup>
            </MarginTop>
          );
        })}
      </>
    );
  };

  return (
    <MarginTop>
      <FlexRow>
        <FormGroup>
          <ControlLabel>Monthly Loan Amount</ControlLabel>
          <FormControl
            type="number"
            value={monthlyLoanAmount}
            disabled={true}
            useNumberFormat={true}
            fixed={2}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Monthly Cost Amount</ControlLabel>

          <FormControl
            type="number"
            value={monthlyCostAmount}
            disabled={true}
            useNumberFormat={true}
            fixed={2}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Total Payment Amount</ControlLabel>
          <FormControl
            type="number"
            value={totalPaymentAmount}
            disabled={true}
            useNumberFormat={true}
            fixed={2}
          />
        </FormGroup>
      </FlexRow>

      <FormGroup>
        <ControlLabel>Loans</ControlLabel>
        <Button size="small" onClick={() => onChangeFeature()}>
          + Add Loans
        </Button>
      </FormGroup>

      {renderLoanForm()}
    </MarginTop>
  );
};

export default LoanForm;
