import FormControl from '@erxes/ui/src/components/form/Control';
import React, { useState } from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { __ } from '@erxes/ui/src/utils';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormGroup,
} from '@erxes/ui/src/components';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IReserveRemParams } from '../types';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src/styles/eindex';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const Form: React.FC<Props> = (props) => {
  const [reserveRemParams, setReserveRemParams] = useState(
    {} as IReserveRemParams,
  );
  const { renderButton, closeModal } = props;

  const generateDoc = (values: { _id?: string }) => {
    const finalValues = values;

    reserveRemParams.remainder = Number(reserveRemParams.remainder || 0);

    return {
      ...finalValues,
      ...reserveRemParams,
    };
  };

  const onInputChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    setReserveRemParams((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onSelectChange = (name, value) => {
    setReserveRemParams((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onAfterSave = () => {
    closeModal();
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>Branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="branchIds"
              initialValue={''}
              onSelect={(branchIds) => onSelectChange('branchIds', branchIds)}
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="departmentIds"
              initialValue={''}
              onSelect={(departmentIds) =>
                onSelectChange('departmentIds', departmentIds)
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
              onSelect={(categoryId) =>
                onSelectChange('productCategoryId', categoryId)
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
              onSelect={(productId) => onSelectChange('productId', productId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true}>Remainder</ControlLabel>
            <FormControl
              type="number"
              name={'remainder'}
              defaultValue={0}
              onChange={onInputChange}
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
            values: generateDoc(values),
            isSubmitted,
            callback: onAfterSave,
            object: reserveRemParams,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
