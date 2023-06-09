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

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  productCategories: IProductCategory[];
  contractType: IContractType;
  closeModal: () => void;
};

type State = {
  productCategoryIds: string[];
  leaseType: string;
  undueCalcType: string;
  useMargin: boolean;
  useDebt: boolean;
  useSkipInterest: boolean;
};

class ContractTypeForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { contractType = {} } = props;

    this.state = {
      undueCalcType: contractType.undueCalcType,
      productCategoryIds: contractType.productCategoryIds,
      leaseType: contractType.leaseType || 'finance',
      useMargin: contractType.useMargin,
      useDebt: contractType.useDebt,
      useSkipInterest: contractType.useSkipInterest
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
      description: finalValues.description
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
    const { closeModal, renderButton } = this.props;
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
            </FormColumn>
            <FormColumn>
              {this.renderFormGroup('Undue Percent', {
                ...formProps,
                name: 'unduePercent',
                defaultValue: contractType.unduePercent || '',
                type: 'number'
              })}

              {/* <FormGroup>
                <ControlLabel>{__('Contract type')}</ControlLabel>
                <Select
                  className="flex-item"
                  placeholder={__('Contract type')}
                  value={this.state.productCategoryIds}
                  onChange={onSelectProductCategory}
                  multi={true}
                  options={['loan', 'leasing', 'pawn'].map((category) => ({
                    value: category,
                    label: category
                  }))}
                />
              </FormGroup> */}
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
                  {['finance', 'salvage'].map((typeName, index) => (
                    <option key={index} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('Undue calc type')}
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
