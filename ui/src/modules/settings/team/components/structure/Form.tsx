import React, { useState } from 'react';
import { FormControl, FormGroup } from 'modules/common/components/form';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from 'modules/common/types';
import Form from 'modules/common/components/form/Form';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IStructure } from '../../types';
import SelectTeamMembers from '../../containers/SelectTeamMembers';
import Box from 'modules/common/components/Box';
import Button from 'modules/common/components/Button';
import ContactInfoForm from '../common/ContactInfoForm';

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
    <Box isOpen={true} title={__('Structure')} name="showStructure">
      <Form renderContent={renderContent} />
    </Box>
  );
}
