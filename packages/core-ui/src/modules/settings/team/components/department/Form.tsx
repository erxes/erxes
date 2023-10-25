import { FormControl, FormGroup } from '@erxes/ui/src/components/form';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import { IDepartment } from '@erxes/ui/src/team/types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { __ } from 'modules/common/utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  item?: IDepartment;
  closeModal: () => void;
  items: IDepartment[];
};

export default function DepartmentForm(props: Props) {
  const { closeModal, renderButton, items, item } = props;
  const object = item || ({} as IDepartment);

  const [userIds, setUserIds] = useState(
    (object.users || []).map(user => user._id)
  );
  const [parentId, setParentId] = useState(object.parentId);
  const [supervisorId, setSupervisorId] = useState(object.supervisorId);

  const generateDoc = values => {
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      userIds,
      parentId,
      supervisorId,
      ...finalValues
    };
  };

  const onChangeParent = (value: any) => {
    if (value) {
      setParentId(value);
    } else {
      setParentId(null);
    }
  };

  const onSelectUsers = values => {
    setUserIds(values);
  };

  const onSelectSupervisor = value => {
    setSupervisorId(value);
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const generateOptions = () => {
      return items.map(branch => (
        <option key={branch._id} value={branch._id}>
          {branch.title}
        </option>
      ));
    };

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
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.description}
            componentClass="textarea"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__('Code')}</ControlLabel>
          <FormControl
            {...formProps}
            name="code"
            defaultValue={object.code}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Supervisor')}</ControlLabel>

          <SelectTeamMembers
            label="Choose supervisor"
            name="supervisorId"
            initialValue={supervisorId}
            onSelect={onSelectSupervisor}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Parent')}</ControlLabel>
          <FormControl
            {...formProps}
            name="parentId"
            componentClass="select"
            defaultValue={parentId || null}
            onChange={onChangeParent}
          >
            <option value="" />
            {generateOptions()}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Team Members')}</ControlLabel>

          <SelectTeamMembers
            label="Choose team members"
            name="userIds"
            initialValue={userIds}
            onSelect={onSelectUsers}
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
