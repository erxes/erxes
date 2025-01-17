import {
  __,
  Button,
  ControlLabel,
  FormGroup,
  extractAttachment,
} from '@erxes/ui/src';
import { IAttachment } from '@erxes/ui/src/types';
import React from 'react';
import Select from 'react-select';

import { Uploader } from '@erxes/ui/src';
import { IIncome } from '../../types';
import { INCOME_TYPES } from '../../constants';
import { MarginTop } from '../../styles';

const getEmptyIncome = () => ({
  _id: Math.random().toString(),
  incomeType: '',
  files: [],
});

type Props = {
  incomes: IIncome[];
  setIncomes: (incomes) => void;
};

const IncomeForm = (props: Props) => {
  const { incomes, setIncomes } = props;

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
            <>
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
            </>
          );
        })}
      </>
    );
  };

  return (
    <MarginTop>
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
