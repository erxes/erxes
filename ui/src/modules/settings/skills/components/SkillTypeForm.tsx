import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import { ISkillTypesDocument } from '../types';

type Props = {
  closeModal: () => void;
  object: ISkillTypesDocument;
  refetch: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

function SkillTypeForm({ closeModal, object, renderButton }: Props) {
  const generateDoc = (values: { _id?: string; name: string }) => {
    const item = object || ({} as ISkillTypesDocument);

    if (item._id) {
      values._id = item._id;
    }

    return values;
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const item = object || ({} as ISkillTypesDocument);

    if (item) {
      values._id = item._id;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={item.name}
            autoFocus={true}
            required={true}
          />
          <ModalFooter>
            <Button
              btnStyle="simple"
              type="button"
              onClick={closeModal}
              icon="cancel-1"
            >
              Cancel
            </Button>

            {renderButton({
              name: 'skill type',
              values: generateDoc(values),
              isSubmitted,
              callback: closeModal,
              object
            })}
          </ModalFooter>
        </FormGroup>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}

export default SkillTypeForm;
