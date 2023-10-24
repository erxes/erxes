import { FormControl, FormGroup } from '@erxes/ui/src/components/form';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IDepartment, IUnit } from '@erxes/ui/src/team/types';
import React, { useState } from 'react';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Select from 'react-select-plus';
import SelectStructureMembers from '../SelectStructureMembers';
import { __ } from 'modules/common/utils';
import { generateTree } from '../../utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  item?: IUnit;
  closeModal: () => void;
  departments: IDepartment[];
};

export default function DepartmentForm(props: Props) {
  const { closeModal, renderButton, departments, item } = props;
  const object = item || ({} as IUnit);

  const [userIds, setUserIds] = useState(
    (object.users || []).map(user => user._id)
  );
  const [departmentId, setDepartmentId] = useState(object.departmentId);
  const [supervisorId, setSupervisorId] = useState(object.supervisorId);

  const generateDoc = values => {
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      userIds,
      departmentId,
      supervisorId,
      ...finalValues
    };
  };

  const onChangeDepartment = (parent: any) => {
    setDepartmentId(parent.value);
  };

  const onSelectUsers = options => {
    setUserIds(options.map(option => option.value));
  };

  const onSelectSupervisor = option => {
    if (option) {
      setSupervisorId(option.value);
    } else {
      setSupervisorId('');
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
            required={true}
            {...formProps}
            name="code"
            defaultValue={object.code}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Supervisor')}</ControlLabel>

          <SelectStructureMembers
            name="supervisorId"
            objectId={object._id}
            value={supervisorId}
            onSelect={onSelectSupervisor}
            multi={false}
            isAllUsers={true}
            excludeUserIds={userIds}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Department')}</ControlLabel>
          <Select
            placeholder={__('Choose department')}
            value={departmentId}
            onChange={onChangeDepartment}
            options={generateTree(departments, '', (node, level) => ({
              value: node._id,
              label: `${'---'.repeat(level)} ${node.title}`
            }))}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Team Members')}</ControlLabel>

          <SelectStructureMembers
            objectId={object._id}
            value={userIds}
            onSelect={onSelectUsers}
            multi={true}
            isAllUsers={true}
            excludeUserIds={[supervisorId]}
            name="userIds"
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
