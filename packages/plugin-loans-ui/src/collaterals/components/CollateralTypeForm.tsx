import React from 'react';
import { useState } from 'react';
import { ICollateralType, ICollateralTypeDocument } from '../types';
import Form from '@erxes/ui/src/components/form/Form';
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
  ScrollWrapper
} from '@erxes/ui/src/styles/main';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Button from '@erxes/ui/src/components/Button';
import { IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';

interface IProps {
  data?: ICollateralTypeDocument;
  renderButton: any;
  closeModal: any;
}



function CollateralTypeForm({ data, renderButton, closeModal }: IProps) {
  const [collateralType, setCollateralType] = useState<
    ICollateralType | undefined
  >(data);

  function formGroup(
    formProps: IFormProps,
    {
      label,
      componentProps,
      ...props
    }: {
      label: string;
      name: string;
      componentclass: string;
      onChange: any;
      componentProps?: any;
    }
  ) {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...formProps} {...props} {...componentProps} value={collateralType?.[props.name]}/>
      </FormGroup>
    );
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollateralType((v: any) => ({
      ...(v ?? {}),
      [e.target.name]: e.target.value
    }));
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted } = formProps;
    return (
      <>
        <ScrollWrapper>
          <FormColumn>
            {formGroup(formProps, {
              label:'Code',
              name: 'code',
              componentclass: 'input',
              onChange
            })}
            {formGroup(formProps, {
              label:'Name',
              name: 'name',
              componentclass: 'input',
              onChange
            })}
            {formGroup(formProps, {
              label:'Description',
              name: 'description',
              componentclass: 'textarea',
              onChange
            })}
            {formGroup(formProps, {
              label:'Type',
              name: 'type',
              componentclass: 'select',
              componentProps: { options: ['car', 'realState'].map(v=>({value:v,label:v})) },
              onChange
            })}
            {formGroup(formProps, {
              label:'Status',
              name: 'status',
              componentclass: 'input',
              onChange
            })}
            {formGroup(formProps, {
              label:'Currency',
              name: 'currency',
              componentclass: 'input',
              onChange
            })}
          </FormColumn>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contract',
            values: collateralType,
            isSubmitted,
            object: data
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}

export default CollateralTypeForm;
