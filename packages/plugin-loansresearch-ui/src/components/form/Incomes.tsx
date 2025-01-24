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
  averageSalaryIncome: number;
  setAverageSalaryIncome: (averageSalaryIncome) => void;
  totalIncome: number;
  setTotalIncome: (totalIncome) => void;
  averageBusinessIncome: number;
  setAverageBusinessIncome: (averageBusinessIncome) => void;
};

const IncomeForm = (props: Props) => {
  const {
    incomes,
    setIncomes,
    averageSalaryIncome,
    setAverageSalaryIncome,
    totalIncome,
    setTotalIncome,
    averageBusinessIncome,
    setAverageBusinessIncome,
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

              {income.incomeType === 'Salary' && (
                <>
                  <FormGroup>
                    <ControlLabel>total Salary Income</ControlLabel>
                    <FormControl
                      type="number"
                      defaultValue={income?.totalSalaryIncome || 0}
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
                      defaultValue={income.businessIncome || 0}
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
          <ControlLabel>Average Salary Income</ControlLabel>
          <FormControl
            type="number"
            defaultValue={averageSalaryIncome}
            onChange={(e: any) =>
              setAverageSalaryIncome(Number(e.target.value))
            }
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Average Business Income</ControlLabel>
          <FormControl
            type="number"
            name="averageBusinessIncome"
            defaultValue={averageBusinessIncome}
            onChange={(e: any) =>
              setAverageBusinessIncome(Number(e.target.value))
            }
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
