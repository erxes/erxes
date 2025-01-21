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
import Select from 'react-select';

import { Uploader } from '@erxes/ui/src';
import { IIncome } from '../../types';
import { INCOME_TYPES } from '../../constants';
import { FlexRow, MarginTop } from '../../styles';

const getEmptyIncome = () => ({
  _id: Math.random().toString(),
  incomeType: '',
  files: [],
});

type Props = {
  incomes: IIncome[];
  setIncomes: (incomes) => void;
  totalMonth: number;
  setTotalMonth: (totalMonth) => void;
  totalIncome: number;
  setTotalIncome: (totalIncome) => void;
  monthlyIncome: number;
  setMonthlyIncome: (monthlyIncome) => void;
};

const IncomeForm = (props: Props) => {
  const {
    incomes,
    setIncomes,
    totalMonth,
    setTotalMonth,
    totalIncome,
    setTotalIncome,
    monthlyIncome,
    setMonthlyIncome,
  } = props;

  const onChangeIncomeItem = (_id: string, key: string, value: any) => {
    const income = incomes.find((f) => f._id === _id);

    if (income) {
      income[key] = value;

      setIncomes([...incomes]);
    }
  };

  const onChangeAttachmentMore = (
    _id: string,
    key: string,
    files: IAttachment[]
  ) => {
    const income = incomes.find((f) => f._id === _id);

    if (income) {
      income[key] = files;

      setIncomes([...incomes]);
    }
  };

  const onChangeFeature = () => {
    setIncomes([...incomes, getEmptyIncome()]);
  };

  const removeFeature = (_id?: string) => {
    const modifiedIncomes = incomes.filter((f) => f._id !== _id);

    setIncomes(modifiedIncomes);
  };

  const renderIncomeForm = () => {
    return (
      <>
        {incomes.map((income) => {
          return (
            <MarginTop borderBottom={true}>
              <FormGroup>
                <ControlLabel>Income type</ControlLabel>
                <Select
                  value={INCOME_TYPES.find(
                    (o) => o.value === income.incomeType
                  )}
                  onChange={(item: any) =>
                    onChangeIncomeItem(income._id, 'incomeType', item.value)
                  }
                  options={INCOME_TYPES}
                  isClearable={false}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Files</ControlLabel>

                <Uploader
                  defaultFileList={
                    (income.files && extractAttachment(income.files)) || []
                  }
                  onChange={(files: any) =>
                    onChangeAttachmentMore(income._id, 'files', files)
                  }
                  multiple={true}
                  single={false}
                />
              </FormGroup>
              <Button
                btnStyle="danger"
                onClick={() => removeFeature(income._id)}
              >
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
          <ControlLabel>Total Month</ControlLabel>
          <FormControl
            type="number"
            defaultValue={totalMonth}
            onChange={(e: any) => setTotalMonth(Number(e.target.value))}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Total Income</ControlLabel>
          <FormControl
            type="number"
            defaultValue={totalIncome}
            onChange={(e: any) => setTotalIncome(Number(e.target.value))}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Monthly Income</ControlLabel>
          <FormControl
            type="number"
            name="monthlyIncome"
            defaultValue={monthlyIncome}
            onChange={(e: any) => setMonthlyIncome(Number(e.target.value))}
          />
        </FormGroup>
      </FlexRow>

      <FormGroup>
        <ControlLabel>Incomes</ControlLabel>
        <Button size="small" onClick={() => onChangeFeature()}>
          + Add Incomes
        </Button>
      </FormGroup>

      {renderIncomeForm()}
    </MarginTop>
  );
};

export default IncomeForm;
