import {
  __,
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
} from '@erxes/ui/src';
import {
  IButtonMutateProps,
  IFormProps,
  IAttachment,
} from '@erxes/ui/src/types';
import React, { useState } from 'react';
import Select from 'react-select';

import { Uploader } from '@erxes/ui/src';
import { IIncome, ILoan, ILoanResearch } from '../types';
import { CUSTOMER_TYPES } from '../constants';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  loansResearch: ILoanResearch;
  closeModal: () => void;
};

const LoansResearchForm = (props: Props) => {
  const {
    loansResearch = {} as ILoanResearch,
    closeModal,
    renderButton,
  } = props;

  const [attachment, setAttachment] = React.useState<IAttachment | undefined>(
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
  const [incomes, setIncomes] = React.useState<IIncome | undefined>(undefined);
  const [loans, setLoans] = React.useState<ILoan | undefined>(undefined);

  const generateDoc = (values: { _id: string } & ILoanResearch) => {
    const finalValues = values;

    if (loansResearch) {
      finalValues._id = loansResearch._id;
    }

    return {
      _id: finalValues._id,
      dealId,
      customerType,
      customerId,
    };
  };

  const onChangeDealId = (e) => {
    setDealId(e.target.value);
  };

  const onChangeCustomerId = (e) => {
    setCustomerId(e.target.value);
  };

  const onCustomerTypeChange = (option) => {
    setCustomerType(option.value);
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    // const attachments =
    //   (car.attachment && extractAttachment([car.attachment])) || [];

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{'Deal'}</ControlLabel>
              <FormControl
                name="dealId"
                onChange={onChangeDealId}
                value={dealId}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>{'Customer'}</ControlLabel>
              <FormControl
                name="customerId"
                value={customerId}
                onChange={onChangeCustomerId}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Customer type</ControlLabel>
              <Select
                value={CUSTOMER_TYPES.find((o) => o.value === customerType)}
                onChange={onCustomerTypeChange}
                options={CUSTOMER_TYPES}
                isClearable={false}
              />
            </FormGroup>
          </FormColumn>

          {/* <FormColumn>
            <FormGroup>
              <ControlLabel>Featured image</ControlLabel>

              <Uploader
                defaultFileList={attachments}
                onChange={onChangeAttachment}
                multiple={false}
                single={true}
              />
            </FormGroup>
          </FormColumn> */}
        </FormWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'loansResearch',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: props.loansResearch,
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

export default LoansResearchForm;
