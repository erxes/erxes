import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { IPaymentDocument } from '../../types';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import { SettingsContent } from './styles';
import { __ } from '@erxes/ui/src/utils';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
import { PAYMENT_KINDS, BANK_CODES } from '../constants';
import Toggle from '@erxes/ui/src/components/Toggle';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  payment?: IPaymentDocument;
  metaData?: any;
};

type State = {
  paymentName: string;
  type: 'company' | 'person' | undefined;
  registerNumber: string;
  name: string;

  mccCode: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;

  companyName: string;
  lastName: string;
  firstName: string;

  bankCode: string;
  bankAccount: string;
  bankAccountName: string;

  merchantId: string;
};

const QuickQrForm = (props: Props) => {
  const { payment, renderButton, closeModal } = props;
  const { config, name } = payment || ({} as IPaymentDocument);

  const [state, setState] = React.useState<State>({
    type: config ? (config.isCompany ? 'company' : 'person') : undefined,
    ...config,
    name
  });

  const generateDoc = () => {
    const generatedValues = {
      name: state.name,
      kind: PAYMENT_KINDS.QPAY_QUICK_QR,
      status: 'active',
      config: {
        isCompany: state.type === 'company',
        registerNumber: state.registerNumber,
        name: state.companyName,
        mccCode: state.mccCode,
        city: state.city,
        district: state.district,
        address: state.address,
        phone: state.phone,
        email: state.email,
        lastName: state.lastName,
        firstName: state.firstName,

        bankCode: state.bankCode,
        bankAccount: state.bankAccount,
        bankAccountName: state.bankAccountName,
        merchantId: state.merchantId
      }
    };

    return payment ? { id: payment._id, ...generatedValues } : generatedValues;
  };

  const onChangeConfig = (code: string, e) => {
    setState({ ...state, [code]: e.target.value });
  };

  const renderItem = (
    key: string,
    title: string,
    description?: string,
    isPassword?: boolean
  ) => {
    const value = state[key];

    return (
      <FormGroup>
        <ControlLabel required={true}>{__(title)}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          required={true}
          defaultValue={value}
          onChange={onChangeConfig.bind(this, key)}
          value={value}
          type={isPassword ? 'password' : ''}
        />
      </FormGroup>
    );
  };

  const renderInputs = formProps => {
    if (!state.type) {
      return null;
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}
      >
        {state.type === 'company' && renderItem('companyName', 'Company Name')}
        {state.type === 'person' && renderItem('firstName', 'First Name')}
        {state.type === 'person' && renderItem('lastName', 'Last Name')}

        {renderItem('registerNumber', 'Register Number')}
        {renderItem('mccCode', 'MCC Code')}
        {renderItem('city', 'City')}
        {renderItem('district', 'District')}
        {renderItem('address', 'Address')}
        {renderItem('phone', 'Phone')}
        {renderItem('email', 'Email')}

        {renderItem(
          'bankAccount',
          'Account Number',
          'The account number to receive payments'
        )}
        <FormGroup>
          <ControlLabel required={true}>Bank</ControlLabel>
          <p>{__('The bank of the account number to receive payments')}</p>
          <FormControl
            {...formProps}
            id="toBank"
            name="toBank"
            componentClass="select"
            required={true}
            defaultValue={state.bankCode}
            onChange={onChangeConfig.bind(this, 'bankCode')}
            errors={formProps.errors}
          >
            <option value="">{__('Select a bank')}</option>
            {BANK_CODES.map(bank => (
              <option key={bank.value} value={bank.value}>
                {bank.label}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        {renderItem('bankAccountName', 'Account Name', 'Account holder name')}
      </div>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted } = formProps;

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {renderItem('name', 'Name')}

          <FormGroup>
            <ControlLabel>{__('Type')}</ControlLabel>
            <FormControl
              componentClass="select"
              required={true}
              defaultValue={state.type}
              onChange={onChangeConfig.bind(this, 'type')}
            >
              <option>{__('Please select a type')}</option>
              <option value={'company'}>{__('Company')}</option>
              <option value={'person'}>{__('Individual')}</option>
            </FormControl>
          </FormGroup>

          {renderInputs(formProps)}
        </SettingsContent>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            Cancel
          </Button>
          {renderButton({
            passedName: 'payment',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default QuickQrForm;
