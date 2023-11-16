import React from 'react';
import { IDictionary } from '../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import Form from '@erxes/ui/src/components/form/Form';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal?: () => void;
  afterSave?: () => void;
  remove?: (type: IDictionary) => void;
  types?: IDictionary[];
  type: IDictionary;
};

const TypeForm = (props: Props) => {
  const { type, closeModal, renderButton, afterSave } = props;
  const generateDoc = (values: {
    id?: string;
    name: string;
    content: string;
  }) => {
    const finalValues = values;

    const { type } = props;

    if (type) {
      finalValues.id = type._id;
    }

    return {
      ...finalValues
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const object = type || ({} as any);
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Parent name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            type="text"
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <ModalFooter id={'AddParentButtons'}>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>

          {renderButton({
            passedName: 'type',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal || afterSave,
            object: type
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default TypeForm;
