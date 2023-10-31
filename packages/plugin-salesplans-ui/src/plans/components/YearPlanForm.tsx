import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { Alert, __ } from '@erxes/ui/src/utils';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IYearPlanParams } from '../types';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src/styles/eindex';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  yearPlanParams: IYearPlanParams;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      yearPlanParams: {
        year: new Date().getFullYear()
      }
    };
  }

  generateDoc = (values: { _id?: string }) => {
    const finalValues = values;
    const { yearPlanParams } = this.state;
    yearPlanParams.year = Number(yearPlanParams.year);

    return {
      ...finalValues,
      ...yearPlanParams
    };
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      yearPlanParams: { ...this.state.yearPlanParams, [name]: value }
    });
  };

  onSelectChange = (name, value) => {
    this.setState({
      yearPlanParams: { ...this.state.yearPlanParams, [name]: value }
    });
  };

  onAfterSave = () => {
    this.props.closeModal();
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const { yearPlanParams } = this.state;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel required={true}>{__(`Year`)}</ControlLabel>
            <FormControl
              {...formProps}
              type="number"
              name="year"
              defaultValue={new Date().getFullYear()}
              autoFocus={true}
              required={true}
              onChange={this.onInputChange}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="selectedBranchId"
              initialValue={''}
              onSelect={branchId => this.onSelectChange('branchId', branchId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="selectedDepartmentId"
              initialValue={''}
              onSelect={departmentId =>
                this.onSelectChange('departmentId', departmentId)
              }
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true}>Product Category</ControlLabel>
            <SelectProductCategory
              label="Choose product category"
              name="productCategoryId"
              initialValue={''}
              onSelect={categoryId =>
                this.onSelectChange('productCategoryId', categoryId)
              }
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true}>Or Product</ControlLabel>
            <SelectProducts
              label="Choose product"
              name="productId"
              initialValue={''}
              onSelect={productId =>
                this.onSelectChange('productId', productId)
              }
              multi={false}
            />
          </FormGroup>
        </ScrollWrapper>
        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            values: this.generateDoc(values),
            isSubmitted,
            callback: this.onAfterSave,
            object: yearPlanParams
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
