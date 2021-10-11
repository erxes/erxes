import React, { useState } from 'react';
import Select from 'react-select-plus';
import { FormControl, FormGroup } from 'modules/common/components/form';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import Form from 'modules/common/components/form/Form';
import Button from 'modules/common/components/Button';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IBranch } from '../../types';
import SelectTeamMembers from '../../containers/SelectTeamMembers';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  branch?: IBranch;
  closeModal: () => void;
  parentBranches: IBranch[];
};

export default function BranchForm(props: Props) {
  const { closeModal, renderButton, parentBranches } = props;
  const object = props.branch || ({} as any);

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
    if (parent) {
      setParentId(parent.value);
    } else {
      setParentId(null);
    }
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
          <ControlLabel required={true}>{__('Address')}</ControlLabel>
          <FormControl
            {...formProps}
            required={true}
            name="address"
            defaultValue={object.address}
            componentClass="textarea"
          />
        </FormGroup>
        {(!object._id || (object._id && object.parentId)) && (
          <FormGroup>
            <ControlLabel>{__('Parent')}</ControlLabel>
            <Select
              placeholder={__('Choose parent')}
              value={parentId}
              clearable={true}
              onChange={onChangeParent}
              options={parentBranches.map(d => ({
                value: d._id,
                label: d.title
              }))}
            />
          </FormGroup>
        )}
        <FormGroup>
          <ControlLabel>{__('Team Members')}</ControlLabel>

          <SelectTeamMembers
            label="Choose team members"
            name="userIds"
            initialValue={userIds}
            onSelect={setUserIds}
          />
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
