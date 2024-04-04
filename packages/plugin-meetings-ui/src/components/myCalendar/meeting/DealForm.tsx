import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IButtonMutateProps, IFormProps, IOption } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  stageId: string;
} & ICommonFormProps;

export const DealForm = (props: Props) => {
  const { stageId } = props;

  const [name, setName] = useState('');

  const generateDoc = (values: { name: string; stageId: string }) => {
    const finalValues = values;

    if (name) {
      finalValues.name = name;
    }
    if (stageId) {
      finalValues.stageId = stageId;
    }
    return {
      ...finalValues
    };
  };

  const onChange = e => {
    setName(e.target.value);
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="Create a new Deal"
            defaultValue={name}
            type="input"
            required={true}
            autoFocus={true}
            onChange={onChange}
          />
        </FormGroup>

        <ModalFooter id={'AddTagButtons'}>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>

          {renderButton({
            passedName: 'meeting',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: name
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};
