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
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { IProductCategory } from '@erxes/ui-products/src/types';
import Select from 'react-select-plus';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

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
};

class ContractTypeForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { contractType = {} } = props;

    this.state = {
      productCategoryIds: contractType.productCategoryIds,
      leaseType: contractType.leaseType || 'finance'
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
      leaseType: this.state.leaseType,
      productCategoryIds: this.state.productCategoryIds,
      description: finalValues.description
    };
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  onChangeField = e => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
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
                defaultValue: contractType.code || ''
              })}
              {this.renderFormGroup('Name', {
                ...formProps,
                name: 'name',
                defaultValue: contractType.name || ''
              })}
              {this.renderFormGroup('Start Number', {
                ...formProps,
                name: 'number',
                defaultValue: contractType.number || ''
              })}
              {this.renderFormGroup('After vacancy count', {
                ...formProps,
                name: 'vacancy',
                type: 'number',
                defaultValue: contractType.vacancy || 0,
                max: 20
              })}
              {this.renderFormGroup('Undue Percent', {
                ...formProps,
                name: 'unduePercent',
                defaultValue: contractType.unduePercent || ''
              })}
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
                <ControlLabel>Allow Product Categories</ControlLabel>
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
            Close
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
