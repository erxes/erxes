import React, { useState } from 'react';
import Select from 'react-select-plus';
import { FormControl, FormGroup } from 'modules/common/components/form';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import Form from 'modules/common/components/form/Form';
import Button from 'modules/common/components/Button';
import ControlLabel from 'modules/common/components/form/Label';
import SelectTeamMembers from '../../containers/SelectTeamMembers';
import { SelectMemberStyled } from 'modules/settings/boards/styles';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  department?: any;
  closeModal: () => void;
  parentDepartments: any[];
};

export default function DepartmentForm(props: Props) {
  const { closeModal, renderButton, parentDepartments } = props;
  const object = props.department || ({} as any);

  const [userIds, setUserIds] = useState(object.userIds || []);
  const [parentId, setParentId] = useState(object.parentId);

  const generateDoc = values => {
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      userIds,
      parentId,
      ...finalValues
    };
  };

  const onChangeParent = (parent: any) => {
    setParentId(parent.value);
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Title')}</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            autoFocus={true}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.description}
            autoFocus={true}
            componentClass="textarea"
          />
        </FormGroup>
        {(!object._id || (object._id && object.parentId)) && (
          <FormGroup>
            <ControlLabel required={true}>{__('Parent')}</ControlLabel>
            <Select
              placeholder={__('Choose parent')}
              value={parentId}
              onChange={onChangeParent}
              options={parentDepartments.map(d => ({
                value: d._id,
                label: d.title
              }))}
            />
          </FormGroup>
        )}
        <FormGroup>
          <SelectMemberStyled zIndex={2002}>
            <ControlLabel>{__('Team Members')}</ControlLabel>

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
            object
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
