import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { __ } from '@erxes/ui/src/utils';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormGroup
} from '@erxes/ui/src/components';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IReserveRemParams } from '../types';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src/styles/eindex';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  reserveRemParams: IReserveRemParams;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      reserveRemParams: {}
    };
  }

  generateDoc = (values: { _id?: string }) => {
    const finalValues = values;
    const { reserveRemParams } = this.state;

    reserveRemParams.remainder = Number(reserveRemParams.remainder || 0);

    return {
      ...finalValues,
      ...reserveRemParams
    };
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      reserveRemParams: { ...this.state.reserveRemParams, [name]: value }
    });
  };

  onSelectChange = (name, value) => {
    this.setState({
      reserveRemParams: { ...this.state.reserveRemParams, [name]: value }
    });
  };

  onAfterSave = () => {
    this.props.closeModal();
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const { reserveRemParams } = this.state;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>Branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="branchIds"
              initialValue={''}
              onSelect={branchIds =>
                this.onSelectChange('branchIds', branchIds)
              }
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="departmentIds"
              initialValue={''}
              onSelect={departmentIds =>
                this.onSelectChange('departmentIds', departmentIds)
              }
              multi={true}
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
          <FormGroup>
            <ControlLabel required={true}>Remainder</ControlLabel>
            <FormControl
              type="number"
              name={'remainder'}
              defaultValue={0}
              onChange={this.onInputChange}
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
            object: reserveRemParams
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
