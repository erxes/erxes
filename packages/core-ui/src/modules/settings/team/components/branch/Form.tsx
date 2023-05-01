import React, { useState } from 'react';
import { FormControl, FormGroup } from '@erxes/ui/src/components/form';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import Form from '@erxes/ui/src/components/form/Form';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from 'modules/common/utils';
import { IBranch } from '@erxes/ui/src/team/types';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import ContactInfoForm from '../common/ContactInfoForm';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  branch?: IBranch;
  closeModal: () => void;
  branches: IBranch[];
};

export default function BranchForm(props: Props) {
  const { closeModal, renderButton } = props;
  const object = props.branch || ({} as IBranch);

  const [userIds, setUserIds] = useState(
    (object.users || []).map(user => user._id)
  );
  const [parentId, setParentId] = useState(object.parentId || null);
  const [links, setLinks] = useState(object.links || {});
  const [image, setImage] = useState(object.image || null);

  const coordinateObj = object.coordinate || {};

  const [coordinate, setCoordinate] = useState({
    longitude: coordinateObj.longitude || '',
    latitude: coordinateObj.latitude || ''
  });

  const generateDoc = values => {
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      userIds,
      parentId,
      links,
      coordinate,
      image,
      ...finalValues,
      radius: Number(finalValues.radius)
    };
  };

  const onChangeParent = (value: any) => {
    if (value) {
      setParentId(value);
    } else {
      setParentId(null);
    }
  };

  const onSelectTeamMembers = (ids: any) => {
    setUserIds(ids);
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
          <ControlLabel>{__('Parent')}</ControlLabel>
          <SelectBranches
            label="Choose parent"
            name="parentId"
            initialValue={parentId || ''}
            onSelect={onChangeParent}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Team Members')}</ControlLabel>

          <SelectTeamMembers
            label="Choose team members"
            name="userIds"
            initialValue={userIds}
            onSelect={onSelectTeamMembers}
          />
        </FormGroup>

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
        <FormGroup>
          <ControlLabel>{__('Radius')}</ControlLabel>
          <FormControl
            {...formProps}
            name="radius"
            defaultValue={object.radius}
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
