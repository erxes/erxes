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
import Select from 'react-select-plus';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { __ } from 'coreui/utils';

import { IContractType, IContractTypeDoc } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { ORGANIZATION_TYPE } from '../../constants';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  productCategories: IProductCategory[];
  contractType: IContractType;
  closeModal: () => void;
  currentUser: IUser;
};

type State = {
  productCategoryIds: string[];
  leaseType: string;
  undueCalcType: string;
  useMargin: boolean;
  useDebt: boolean;
  useSkipInterest: boolean;
  currency: string;
  useManualNumbering: boolean;
  useFee: boolean;
  productType: string;
};

class ContractTypeForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { contractType = {} } = props;

    this.state = {
      undueCalcType: contractType.undueCalcType || 'fromInterest',
      productCategoryIds: contractType.productCategoryIds,
      leaseType: contractType.leaseType || 'finance',
      useMargin: contractType.useMargin,
      useDebt: contractType.useDebt,
      useSkipInterest: contractType.useSkipInterest,
      useManualNumbering: contractType.useManualNumbering,
      useFee: contractType.useFee,
      productType: contractType.productType,
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
      unduePercent: Number(finalValues.unduePercent),
      undueCalcType: finalValues.undueCalcType,
      useMargin: this.state.useMargin,
      useDebt: this.state.useDebt,
      useSkipInterest: this.state.useSkipInterest,
      leaseType: this.state.leaseType,
      productCategoryIds: this.state.productCategoryIds,
      description: finalValues.description,
      productType: this.state.productType,
      currency: finalValues.currency
    };
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
    const { closeModal, renderButton, currentUser } = this.props;
    const { values, isSubmitted } = formProps;

    const onSelectProductCategory = values => {
      this.setState({ productCategoryIds: values.map(item => item.value) });
    };

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
                <ControlLabel>{__('Allow Product Categories')}</ControlLabel>
                <Select
                  className="flex-item"
                  placeholder={__('Select product categories')}
                  value={this.state.productCategoryIds}
                  onChange={onSelectProductCategory}
                  multi={true}
                  options={this.props.productCategories.map(category => ({
                    value: category._id,
                    label: `${'\u00A0  '.repeat(
                      (category.order.match(/[/]/gi) || []).length
                    )}${category.code} - ${category.name}`
                  }))}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('Loss calc type')}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="productType"
                  componentClass="select"
                  value={this.state.productType}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {['private', 'public'].map((typeName, index) => (
                    <option key={`undeType${index}`} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
            </FormColumn>
            <FormColumn>
              {this.renderFormGroup('Loss Percent', {
                ...formProps,
                name: 'unduePercent',
                defaultValue: contractType.unduePercent || '',
                type: 'number'
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
              <FormGroup>
                <ControlLabel>{__('Lease Type')}:</ControlLabel>

                <FormControl
                  {...this.props}
                  name="leaseType"
                  componentClass="select"
                  value={this.state.leaseType}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {['finance', 'linear', 'creditCard'].map(
                    (typeName, index) => (
                      <option key={index} value={typeName}>
                        {typeName}
                      </option>
                    )
                  )}
                </FormControl>
              </FormGroup>
              {currentUser?.configs?.loansConfig?.organizationType ===
                ORGANIZATION_TYPE.ENTITY && (
                <FormGroup>
                  <ControlLabel required={true}>
                    {__('Loss calc type')}
                  </ControlLabel>
                  <FormControl
                    {...formProps}
                    name="undueCalcType"
                    componentClass="select"
                    value={this.state.undueCalcType}
                    required={true}
                    onChange={this.onChangeField}
                  >
                    {[
                      'fromInterest',
                      'fromAmount',
                      'fromTotalPayment',
                      'fromEndAmount'
                    ].map((typeName, index) => (
                      <option key={`undeType${index}`} value={typeName}>
                        {typeName}
                      </option>
                    ))}
                  </FormControl>
                </FormGroup>
              )}
              {this.renderFormGroup('Is use debt', {
                ...formProps,
                className: 'flex-item',
                type: 'checkbox',
                componentClass: 'checkbox',
                name: 'useDebt',
                checked: this.state.useDebt,
                onChange: this.onChangeField
              })}
              {this.renderFormGroup('Is use margin amount', {
                ...formProps,
                className: 'flex-item',
                type: 'checkbox',
                componentClass: 'checkbox',
                name: 'useMargin',
                checked: this.state.useMargin,
                onChange: this.onChangeField
              })}
              {this.renderFormGroup('Is use skip interest', {
                ...formProps,
                className: 'flex-item',
                type: 'checkbox',
                componentClass: 'checkbox',
                name: 'useSkipInterest',
                checked: this.state.useSkipInterest,
                onChange: this.onChangeField
              })}
              {this.renderFormGroup('Is use manual numbering', {
                ...formProps,
                className: 'flex-item',
                type: 'checkbox',
                componentClass: 'checkbox',
                name: 'useManualNumbering',
                checked: this.state.useManualNumbering,
                onChange: this.onChangeField
              })}
              {this.renderFormGroup('Is use fee', {
                ...formProps,
                className: 'flex-item',
                type: 'checkbox',
                componentClass: 'checkbox',
                name: 'useFee',
                checked: this.state.useFee,
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
