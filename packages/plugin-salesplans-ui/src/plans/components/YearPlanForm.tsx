import React, { useState } from 'react';
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
  FormGroup,
} from '@erxes/ui/src/components';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src/styles/eindex';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const YearPlanForm = (props: Props) => {
  const { renderButton, closeModal } = props;

  const [yearPlanParams, setYearPlanParams] = useState<IYearPlanParams>({
    year: new Date().getFullYear(),
  });

  const generateDoc = (values: { _id?: string }) => {
    const finalValues = values;
    yearPlanParams.year = Number(yearPlanParams.year);

    return {
      ...finalValues,
      ...yearPlanParams,
    };
  };

  const onInputChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    setYearPlanParams((prevState) => ({ ...prevState, [name]: value }));
  };

  const onSelectChange = (name, value) => {
    setYearPlanParams((prevState) => ({ ...prevState, [name]: value }));
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__(`Year`)}</ControlLabel>
          <FormControl
            {...formProps}
            type="number"
            name="year"
            defaultValue={new Date().getFullYear()}
            autoFocus={true}
            required={true}
            onChange={onInputChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Branch</ControlLabel>
          <SelectBranches
            label="Choose branch"
            name="selectedBranchId"
            initialValue={''}
            onSelect={(branchId) => onSelectChange('branchId', branchId)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Department</ControlLabel>
          <SelectDepartments
            label="Choose department"
            name="selectedDepartmentId"
            initialValue={''}
            onSelect={(departmentId) =>
              onSelectChange('departmentId', departmentId)
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
            callback: closeModal,
            object: yearPlanParams,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default YearPlanForm;
