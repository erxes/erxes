import {
  __,
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { FormLabel } from '@erxes/ui/src/components/form/styles';
import React, { useState } from 'react';
import Select from 'react-select';
import Datetime from '@nateradebaugh/react-datetime';
import { DateContainer, FormColumn } from '@erxes/ui/src/styles/main';
import { IExchangeRate } from '../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  exchangeRate?: IExchangeRate;
  closeModal: () => void;
  currencies: string[];
};

const ExchangeRateForm = (props: Props) => {
  const {
    exchangeRate = {} as IExchangeRate,
    closeModal,
    renderButton,
    currencies,
  } = props;

  const [date, setDate] = useState<Date>(exchangeRate?.date || new Date());
  const [mainCurrency, setMainCurrency] = useState<string>(
    exchangeRate?.mainCurrency || ''
  );
  const [rateCurrency, setRateCurrency] = useState<string>(
    exchangeRate?.rateCurrency || ''
  );
  const [rate, setRate] = useState<number>(exchangeRate?.rate);

  const generateDoc = (values: { _id: string } & IExchangeRate) => {
    const finalValues = values;

    if (exchangeRate) {
      finalValues._id = exchangeRate._id;
    }

    return {
      _id: finalValues._id,
      date,
      mainCurrency,
      rateCurrency,
      rate,
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const generateOptions = () => {
      return currencies.map((item) => ({
        label: item,
        value: item,
      }));
    };

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <FormLabel>{__('Start Date')}</FormLabel>
              <DateContainer>
                <Datetime
                  dateFormat="YYYY-MM-DD"
                  closeOnSelect={true}
                  utc={true}
                  timeFormat={false}
                  defaultValue={date}
                  onChange={(e: any) =>
                    setDate(new Date(e.getTime() || new Date()))
                  }
                />
              </DateContainer>
            </FormGroup>

            <FormGroup>
              <ControlLabel>{'Main Currency'}</ControlLabel>
              <Select
                {...formProps}
                placeholder={__('Choose a main currency')}
                value={generateOptions().find(
                  (option) => option.value === mainCurrency
                )}
                options={generateOptions()}
                isClearable={true}
                onChange={(option: any) => setMainCurrency(option.value)}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>{'Rate Currency'}</ControlLabel>
              <Select
                {...formProps}
                placeholder={__('Choose a rate currency')}
                value={generateOptions().find(
                  (option) => option.value === rateCurrency
                )}
                options={generateOptions()}
                isClearable={true}
                onChange={(option: any) => setRateCurrency(option.value)}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>{'Rate'}</ControlLabel>
              <FormControl
                type="number"
                name="number"
                defaultValue={rate}
                onChange={(e: any) => setRate(Number(e.target.value))}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'exchangeRate',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: props.exchangeRate,
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

export default ExchangeRateForm;
