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

import { Uploader } from '@erxes/ui/src';
import { ILoan } from '../../types';
import { MarginTop } from '../../styles';
import { FormLabel } from '@erxes/ui/src/components/form/styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { FlexRow } from '../../styles';

const getEmptyIncome = () => ({
  _id: Math.random().toString(),
  startDate: '',
  closeDate: '',
  files: [],
});

type Props = {
  loans: ILoan[];
  setLoans: (loans) => void;
  totalLoanAmount: number;
  setTotalLoanAmount: (totalLoanAmount) => void;
  monthlyPaymentAmount: number;
  setMonthlyPaymentAmount: (monthlyPaymentAmount) => void;
};

const LoanForm = (props: Props) => {
  const {
    loans,
    setLoans,
    totalLoanAmount,
    setTotalLoanAmount,
    monthlyPaymentAmount,
    setMonthlyPaymentAmount,
  } = props;

  const onChangeAttachmentMore = (
    _id: string,
    key: string,
    files: IAttachment[]
  ) => {
    const loan = loans.find((f) => f._id === _id);

    if (loan) {
      loan[key] = files;

      setLoans([...loans]);
    }
  };

  const onChangeDate = (_id: string, key: string, date: any) => {
    const loan = loans.find((f) => f._id === _id);

    if (loan) {
      loan[key] = date;

      setLoans([...loans]);
    }
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
              </FormGroup>
              <Button btnStyle="danger" onClick={() => removeFeature(loan._id)}>
                X
              </Button>
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
          <ControlLabel>Total Loan Amount</ControlLabel>
          <FormControl
            type="number"
            defaultValue={totalLoanAmount}
            onChange={(e: any) => setTotalLoanAmount(Number(e.target.value))}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Monthly Payment Amount</ControlLabel>
          <FormControl
            type="number"
            defaultValue={monthlyPaymentAmount}
            onChange={(e: any) =>
              setMonthlyPaymentAmount(Number(e.target.value))
            }
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
