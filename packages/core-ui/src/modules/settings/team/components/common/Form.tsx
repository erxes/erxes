import React, { useState } from 'react';
import { FormControl, FormGroup } from '@erxes/ui/src/components/form';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import Form from '@erxes/ui/src/components/form/Form';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from 'modules/common/utils';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import ContactInfoForm from './ContactInfoForm';
import { generateTree } from '../../utils';
import Select from 'react-select-plus';

type CommonProps = {
  type: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  item?: any;
  closeModal: () => void;
  items: any[];
  departments: any[];
};

export default function OrganizationForm(props: CommonProps) {
  const { type, closeModal, renderButton, items, departments } = props;
  const object = props.item || {};

  const [userIds, setUserIds] = useState(
    (object.users || []).map(user => user._id)
  );
  const [parentId, setParentId] = useState(object.parentId);
  const [supervisorId, setSupervisorId] = useState(object.supervisorId);
  const [links, setLinks] = useState(
    type === 'branches' ? object.links || {} : null
  );
  const [image, setImage] = useState(
    type === 'branches' ? object.image || null : null
  );
  const coordinateObj = type === 'branches' ? object.coordinate || {} : null;

  const [coordinate, setCoordinate] = useState(
    type === 'branches'
      ? {
          longitude: coordinateObj.longitude || '',
          latitude: coordinateObj.latitude || ''
        }
      : null
  );

  const generateDoc = values => {
    const finalValues = values;
    if (object) {
      finalValues._id = object._id;
    }

    const doc = {
      userIds,
      parentId,
      supervisorId,
      ...finalValues
    };

    if (type === 'branches') {
      doc.links = links;
      doc.coordinate = coordinate;
      doc.image = image;
      doc.radius = Number(finalValues.radius);
    }

    return doc;
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

  const [departmentId, setDepartmentId] = useState(object.departmentId || null);

  const onChangeDepartment = selectedOption => {
    if (selectedOption) {
      setDepartmentId(selectedOption.value);
    } else {
      setDepartmentId(null);
    }
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const generateOptions = () => {
      return items.map(item => (
        <option key={item._id} value={item._id}>
          {item.title}
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
        {type === 'branches' && (
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
        )}
        {type === 'departments' && (
          <FormGroup>
            <ControlLabel>{__('Description')}</ControlLabel>
            <FormControl
              {...formProps}
              name="description"
              defaultValue={object.description}
              componentClass="textarea"
            />
          </FormGroup>
        )}
        <FormGroup>
          <ControlLabel required={true}>{__('Code')}</ControlLabel>
          <FormControl
            {...formProps}
            required={true}
            name="code"
            defaultValue={object.code}
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

        {type === 'units' && (
          <FormGroup>
            <ControlLabel>{__('Department')}</ControlLabel>
            <Select
              placeholder={__('Choose department')}
              value={departmentId}
              onChange={onChangeDepartment}
              options={generateTree(departments, null, (node, level) => ({
                value: node._id,
                label: `${'---'.repeat(level)} ${node.title}`
              }))}
            />
          </FormGroup>
        )}

        {type !== 'units' && (
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
        )}
        <FormGroup>
          <ControlLabel>{__('Team Members')}</ControlLabel>
          <SelectTeamMembers
            label="Choose team members"
            name="userIds"
            initialValue={userIds}
            onSelect={onSelectUsers}
          />
        </FormGroup>

        {type === 'branches' && (
          <ContactInfoForm
            object={object}
            formProps={formProps}
            setLinks={setLinks}
            links={links}
            setCoordinate={setCoordinate}
            coordinate={coordinate}
            setImage={setImage}
            image={image}
          />
        )}
        {type === 'branches' && (
          <FormGroup>
            <ControlLabel>{__('Radius')}</ControlLabel>
            <FormControl
              {...formProps}
              name="radius"
              defaultValue={object.radius}
            />
          </FormGroup>
        )}
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
