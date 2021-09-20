import React, { useState } from 'react';
import { FormControl, FormGroup } from 'modules/common/components/form';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import Form from 'modules/common/components/form/Form';
import Button from 'modules/common/components/Button';
import ControlLabel from 'modules/common/components/form/Label';
import SelectTeamMembers from '../../containers/SelectTeamMembers';
import { SelectMemberStyled } from 'modules/settings/boards/styles';
import { ModalFooter } from 'modules/common/styles/main';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  department?: any;
  closeModal: () => void;
};

export default function DepartmentForm(props: Props) {
  const { closeModal, renderButton } = props;
  const object = props.department || ({} as any);

  const [userIds, setUserIds] = useState(object.userIds || []);

  const generateDoc = values => {
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      userIds,
      ...finalValues
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.name}
            autoFocus={true}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.name}
            autoFocus={true}
            componentClass="textarea"
          />
        </FormGroup>
        <FormGroup>
          <SelectMemberStyled zIndex={2002}>
            <ControlLabel>Team Members</ControlLabel>

            <SelectTeamMembers
              label="Choose team members"
              name="userIds"
              initialValue={userIds}
              onSelect={setUserIds}
            />
          </SelectMemberStyled>
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: values.title,
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object,
            confirmationUpdate: true
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
