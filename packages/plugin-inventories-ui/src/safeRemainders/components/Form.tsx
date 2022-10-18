import React, { useState } from 'react';
import Datetime from '@nateradebaugh/react-datetime';
// erxes
import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import FormControl from '@erxes/ui/src/components/form/Control';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

export default function FormComponent(props: Props) {
  const { renderButton, closeModal } = props;

  // Hooks
  const [branchId, setBranchId] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');

  // Methods
  const generateDoc = (values: {}) => {
    const finalValues = values;

    return {
      ...finalValues,
      branchId,
      departmentId,
      date,
      description,
      categoryId
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel>{__('Date')}</ControlLabel>
              <Datetime
                inputProps={{ placeholder: 'Click to select a date' }}
                dateFormat="YYYY MM DD"
                timeFormat=""
                viewMode={'days'}
                closeOnSelect
                utc
                input
                value={date}
                onChange={(date: any) => setDate(new Date(date || new Date()))}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required>Description</ControlLabel>
              <FormControl
                {...formProps}
                name="description"
                defaultValue={description}
                onChange={(event: any) =>
                  setDescription(
                    (event.currentTarget as HTMLButtonElement).value
                  )
                }
                autoFocus
                required
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>{__('Branch')}</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="selectedBranchIds"
                initialValue={branchId}
                onSelect={(branchId: any) => setBranchId(String(branchId))}
                multi={false}
                customOption={{ value: '', label: 'All branches' }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Department')}</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="selectedDepartmentIds"
                initialValue={departmentId}
                onSelect={(departmentId: any) =>
                  setDepartmentId(String(departmentId))
                }
                multi={false}
                customOption={{ value: '', label: 'All departments' }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Product Categories')}</ControlLabel>
              <SelectProductCategory
                label="Choose product category"
                name="selectedProductCategoryId"
                initialValue={categoryId}
                onSelect={(categoryId: any) =>
                  setCategoryId(categoryId as string)
                }
                multi={false}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

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
            name: 'product and service',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
}
