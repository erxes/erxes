import React, { useState } from 'react';
import { FormControl, FormGroup } from '@erxes/ui/src/components/form';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import Form from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from 'modules/common/utils';
import { IStructure } from '@erxes/ui/src/team/types';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Button from '@erxes/ui/src/components/Button';
import ContactInfoForm from '../common/ContactInfoForm';
import { Title } from '@erxes/ui-settings/src/styles';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  structure?: IStructure;
  showView: () => void;
};

export default function StructureForm(props: Props) {
  const { structure, renderButton, showView } = props;
  const object = structure || ({} as IStructure);

  const dbImage = object.image || null;

  const [supervisorId, setSupervisorId] = useState(object.supervisorId || '');
  const [links, setLinks] = useState(object.links || {});
  const [image, setImage] = useState(
    dbImage
      ? ({
          name: dbImage.name,
          type: dbImage.type,
          url: dbImage.url,
          size: dbImage.size
        } as IAttachment)
      : null
  );

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
      supervisorId,
      links,
      coordinate,
      image,
      ...finalValues
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <div style={{ padding: '20px' }}>
        <FormGroup>
          <ControlLabel required={true}>{__('Name')}</ControlLabel>
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
          <ControlLabel>{__('Code')}</ControlLabel>
          <FormControl {...formProps} name="code" defaultValue={object.code} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Supervisor')}</ControlLabel>

          <SelectTeamMembers
            label="Choose supervisor"
            name="supervisorId"
            multi={false}
            initialValue={supervisorId}
            onSelect={value => setSupervisorId(value.toString())}
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

        <ModalFooter>
          <Button
            style={{ float: 'left' }}
            btnStyle="simple"
            type="button"
            onClick={showView}
            icon="arrow-left"
          >
            {__('Back')}
          </Button>
          {renderButton({
            name: values.title,
            values: generateDoc(values),
            isSubmitted,
            object
          })}
        </ModalFooter>
      </div>
    );
  };

  return (
    <>
      <Wrapper.ActionBar
        background="bgWhite"
        left={<Title capitalize={true}>{__('Structure')}</Title>}
        wideSpacing={true}
      />
      <Form renderContent={renderContent} />
    </>
  );
}
