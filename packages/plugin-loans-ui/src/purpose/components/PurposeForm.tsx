import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src/styles/eindex';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from 'coreui/utils';
import React, { useState } from 'react';
import { IPurpose, IPurposeDoc } from '../types';
import { generateCategoryOptions } from '../categories';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  purpose?: IPurpose;
  purposes: IPurpose[];
  closeModal: () => void;
};

const PurposeForm = (props: Props) => {
  const [purpose, setPurpose] = useState(props.purpose || ({} as IPurpose));
  const { purposes } = props;

  const generateDoc = (values: { _id: string } & IPurposeDoc) => {
    const finalValues = values;

    if (props.purpose) {
      finalValues._id = props.purpose._id;
    }

    return {
      ...purpose,
      _id: finalValues._id,
    };
  };

  const renderFormGroup = (label, props) => {
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

  const onChangeField = (e) => {
    const name = (e.target as HTMLInputElement).name;
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setPurpose({ ...purpose, [name]: value });
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              {renderFormGroup('Code', {
                ...formProps,
                name: 'code',
                required: true,
                defaultValue: purpose.code || '',
                onChange: onChangeField,
              })}
              {renderFormGroup('Name', {
                ...formProps,
                name: 'name',
                required: true,
                defaultValue: purpose.name || '',
                onChange: onChangeField,
              })}
              <FormGroup>
                <ControlLabel>Parent Category</ControlLabel>

                <FormControl
                  {...formProps}
                  name="parentId"
                  componentclass="select"
                  defaultValue={purpose.parentId}
                  onChange={onChangeField}
                >
                  <option value="" />
                  {generateCategoryOptions(purposes, purpose._id, true)}
                </FormControl>
              </FormGroup>
              {renderFormGroup('Description', {
                ...formProps,
                name: 'description',
                defaultValue: purpose.description || '',
                onChange: onChangeField,
              })}
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'purpose',
            values: generateDoc(values),
            isSubmitted,
            object: props.purpose,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default PurposeForm;
