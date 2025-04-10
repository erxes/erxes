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
  _id: crypto.randomUUID(),
  incomeType: '',
  files: [],
});

type Props = {
  incomes: IIncome[];
  setIncomes: (incomes) => void;
  averageSalaryIncome: number;
  totalIncome: number;
  averageBusinessIncome: number;
};

const IncomeForm = (props: Props) => {
  const {
    incomes,
    setIncomes,
    averageSalaryIncome,
    totalIncome,
    averageBusinessIncome,
  } = props;

  const onChangeIncomeItem = (_id: string, key: string, value: any) => {
    setIncomes((prevIncomes) =>
      prevIncomes.map(
        (income) =>
          income._id === _id
            ? { ...income, [key]: value } // Update the specific key
            : income // Leave other incomes unchanged
      )
    );
  };

  const onChangeAttachmentMore = (
    _id: string,
    key: string,
    files: IAttachment[]
  ) => {
    setIncomes((prevIncomes) =>
      prevIncomes.map(
        (income) =>
          income._id === _id
            ? { ...income, [key]: files } // Update the specific key
            : income // Leave other incomes unchanged
      )
    );
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

              {income.incomeType === 'Salary' && (
                <>
                  <FormGroup>
                    <ControlLabel>total Salary Income</ControlLabel>
                    <FormControl
                      type="number"
                      value={income?.totalSalaryIncome || 0}
                      useNumberFormat={true}
                      fixed={2}
                      onChange={(e: any) =>
                        onChangeIncomeItem(
                          income._id,
                          'totalSalaryIncome',
                          Number(e.target.value)
                        )
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>total month</ControlLabel>
                    <FormControl
                      type="number"
                      defaultValue={income?.totalMonth || 0}
                      onChange={(e: any) =>
                        onChangeIncomeItem(
                          income._id,
                          'totalMonth',
                          Number(e.target.value)
                        )
                      }
                    />
                  </FormGroup>
                </>
              )}

              {income.incomeType === 'Business' && (
                <>
                  <FormGroup>
                    <ControlLabel>business Line</ControlLabel>
                    <FormControl
                      type="text"
                      defaultValue={income?.businessLine || ''}
                      onChange={(e: any) =>
                        onChangeIncomeItem(
                          income._id,
                          'businessLine',
                          e.target.value
                        )
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>business Details</ControlLabel>
                    <FormControl
                      type="text"
                      defaultValue={income?.businessDetails || ''}
                      onChange={(e: any) =>
                        onChangeIncomeItem(
                          income._id,
                          'businessDetails',
                          e.target.value
                        )
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>business profile</ControlLabel>
                    <FormControl
                      type="text"
                      defaultValue={income?.businessProfile || ''}
                      onChange={(e: any) =>
                        onChangeIncomeItem(
                          income._id,
                          'businessProfile',
                          e.target.value
                        )
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>business income</ControlLabel>
                    <FormControl
                      type="number"
                      useNumberFormat={true}
                      fixed={2}
                      value={income.businessIncome || 0}
                      onChange={(e: any) =>
                        onChangeIncomeItem(
                          income._id,
                          'businessIncome',
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
                    (income.files && extractAttachment(income.files)) || []
                  }
                  onChange={(files: any) =>
                    onChangeAttachmentMore(income._id, 'files', files)
                  }
                  multiple={true}
                  single={false}
                />
              </FormGroup>

              {income.incomeType === 'Business' && (
                <Button
                  btnStyle="danger"
                  onClick={() => removeFeature(income._id)}
                >
                  X
                </Button>
              )}
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
          <ControlLabel>Average Salary Income</ControlLabel>
          <FormControl
            type="number"
            value={averageSalaryIncome}
            disabled={true}
            useNumberFormat={true}
            fixed={2}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Average Business Income</ControlLabel>
          <FormControl
            type="number"
            name="averageBusinessIncome"
            value={averageBusinessIncome}
            disabled={true}
            useNumberFormat={true}
            fixed={2}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Total Income</ControlLabel>
          <FormControl
            type="number"
            value={totalIncome}
            disabled={true}
            useNumberFormat={true}
            fixed={2}
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
