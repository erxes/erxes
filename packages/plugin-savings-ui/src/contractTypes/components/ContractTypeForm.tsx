import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { IProductCategory } from '@erxes/ui-products/src/types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { __ } from 'coreui/utils';

import { IContractType, IContractTypeDoc } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contractType: IContractType;
  closeModal: () => void;
  currentUser: IUser;
};

class ContractTypeForm extends React.Component<Props, IContractTypeDoc> {
  constructor(props) {
    super(props);

    const { contractType = {} } = props;

    this.state = {
      code: contractType.code,
      name: contractType.name,
      description: contractType.description,
      status: contractType.status,
      number: contractType.number,
      vacancy: contractType.vacancy,
      branchId: contractType.vacancy,
      interestCalcType: contractType.interestCalcType,
      storeInterestInterval: contractType.storeInterestInterval,
      isAllowIncome: contractType.isAllowIncome,
      isAllowOutcome: contractType.isAllowOutcome,
      interestRate: contractType.interestRate,
      closeInterestRate: contractType.closeInterestRate,
      currency:
        contractType.currency || this.props.currentUser.configs?.dealCurrency[0]
    };
  }

  generateDoc = (values: { _id: string } & IContractTypeDoc) => {
    const { contractType } = this.props;

    const finalValues = values;

    if (contractType) {
      finalValues._id = contractType._id;
    }

    return {
      _id: finalValues._id,
      ...this.state,
      code: finalValues.code,
      name: finalValues.name,
      number: finalValues.number,
      vacancy: Number(finalValues.vacancy),
      isAllowIncome: this.state.isAllowIncome,
      isAllowOutcome: this.state.isAllowOutcome,
      interestCalcType: this.state.interestCalcType,
      storeInterestInterval: this.state.storeInterestInterval,
      description: finalValues.description,
      currency: finalValues.currency,
      interestRate: Number(finalValues.interestRate),
      closeInterestRate: Number(finalValues.closeInterestRate),
      branchId: finalValues.branchId,
      status: finalValues.status
    } as IContractTypeDoc;
  };

  renderFormGroup = (label, props) => {
    if (props.type === 'checkbox')
      return (
        <FormGroup>
          <FormControl {...props} />
          <ControlLabel required={props.required}>{__(label)}</ControlLabel>
        </FormGroup>
      );
    return (
      <FormGroup>
        <ControlLabel required={props.required}>{__(label)}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  onChangeField = e => {
    const name = (e.target as HTMLInputElement).name;
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : (e.target as HTMLInputElement).value;

    this.setState({ [name]: value } as any);
  };

  renderContent = (formProps: IFormProps) => {
    const contractType = this.props.contractType || ({} as IContractType);
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              {this.renderFormGroup('Code', {
                ...formProps,
                name: 'code',
                required: true,
                defaultValue: contractType.code || ''
              })}
              {this.renderFormGroup('Name', {
                ...formProps,
                name: 'name',
                required: true,
                defaultValue: contractType.name || ''
              })}
              {this.renderFormGroup('Start Number', {
                ...formProps,
                name: 'number',
                required: true,
                defaultValue: contractType.number || ''
              })}
              {this.renderFormGroup('After vacancy count', {
                ...formProps,
                name: 'vacancy',
                required: true,
                type: 'number',
                defaultValue: contractType.vacancy || 1,
                max: 20
              })}
              <FormGroup>
                <ControlLabel required={true}>{__('Currency')}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="currency"
                  componentClass="select"
                  value={this.state.currency}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {this.props.currentUser.configs?.dealCurrency?.map(
                    (typeName, index) => (
                      <option key={index} value={typeName}>
                        {typeName}
                      </option>
                    )
                  )}
                </FormControl>
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Store interest interval')}:</ControlLabel>

                <FormControl
                  {...this.props}
                  name="storeInterestInterval"
                  componentClass="select"
                  value={this.state.storeInterestInterval}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {['daily', 'montly', 'endOfMonth', 'endOfContract'].map(
                    (typeName, index) => (
                      <option key={index} value={typeName}>
                        {typeName}
                      </option>
                    )
                  )}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('Interest calc type')}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="interestCalcType"
                  componentClass="select"
                  value={this.state.interestCalcType}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {[
                    'Сар бүр /ХХОАТ суутгана/',
                    'Хугацааны эцэст /ХХОАТ суутгана/'
                  ].map((typeName, index) => (
                    <option key={`interetCalcType${index}`} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              {this.renderFormGroup('Interest Rate', {
                ...formProps,
                className: 'flex-item',
                type: 'number',
                useNumberFormat: true,
                name: 'interestRate',
                value: this.state.interestRate,
                onChange: this.onChangeField
              })}
              {this.renderFormGroup('Close Interest Rate', {
                ...formProps,
                className: 'flex-item',
                type: 'number',
                useNumberFormat: true,
                name: 'closeInterestRate',
                value: this.state.closeInterestRate,
                onChange: this.onChangeField
              })}
              {this.renderFormGroup('Is allow income', {
                ...formProps,
                className: 'flex-item',
                type: 'checkbox',
                componentClass: 'checkbox',
                name: 'isAllowIncome',
                checked: this.state.isAllowIncome,
                onChange: this.onChangeField
              })}
              {this.renderFormGroup('Is allow outcome', {
                ...formProps,
                className: 'flex-item',
                type: 'checkbox',
                componentClass: 'checkbox',
                name: 'isAllowOutcome',
                checked: this.state.isAllowOutcome,
                onChange: this.onChangeField
              })}
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              {this.renderFormGroup('Description', {
                ...formProps,
                name: 'description',
                max: 140,
                componentClass: 'textarea',
                defaultValue: contractType.description || ''
              })}
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contractType',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.contractType
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default ContractTypeForm;
