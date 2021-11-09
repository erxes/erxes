import React, { useState } from 'react';
import { FormControl, FormGroup } from 'modules/common/components/form';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import Form from 'modules/common/components/form/Form';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IStructure } from '../../types';
import SelectTeamMembers from '../../containers/SelectTeamMembers';
import Box from 'modules/common/components/Box';
import Button from 'modules/common/components/Button';
import Uploader from 'modules/common/components/Uploader';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  structure?: IStructure;
  showView: () => void;
};

export default function StructureForm(props: Props) {
  const { structure, renderButton, showView } = props;
  const object = structure || ({} as IStructure);

  const [supervisorId, setSupervisorId] = useState(object.supervisorId || '');
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
      supervisorId,
      links,
      coordinate,
      image,
      ...finalValues
    };
  };

  const onChangeLink = e => {
    const { name, value } = e.target;

    setLinks({ ...links, [name]: value });
  };

  const onChangeCoordinate = e => {
    const { name, value } = e.target;

    setCoordinate({ ...coordinate, [name]: value });
  };

  const onChangeImage = images => {
    if (images && images.length > 0) {
      setImage(images[0]);
    } else {
      setImage(null);
    }
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
        <FormGroup>
          <ControlLabel>{__('Phone number')}</ControlLabel>
          <FormControl
            {...formProps}
            name="phoneNumber"
            defaultValue={object.phoneNumber}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Email')}</ControlLabel>
          <FormControl
            {...formProps}
            name="email"
            defaultValue={object.email}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Longitude')}</ControlLabel>
          <FormControl
            name="longitude"
            onChange={onChangeCoordinate}
            defaultValue={coordinate.longitude}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Latitude')}</ControlLabel>
          <FormControl
            name="latitude"
            onChange={onChangeCoordinate}
            defaultValue={coordinate.latitude}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Website')}</ControlLabel>
          <FormControl
            name="website"
            placeholder="https://example.com"
            defaultValue={links.website}
            onChange={onChangeLink}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Facebook')}</ControlLabel>
          <FormControl
            name="facebook"
            placeholder="https://facebook.com"
            defaultValue={links.facebook}
            onChange={onChangeLink}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Twitter')}</ControlLabel>
          <FormControl
            name="twitter"
            defaultValue={links.twitter}
            placeholder="https://twitter.com"
            onChange={onChangeLink}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Youtube')}</ControlLabel>
          <FormControl
            name="youtube"
            defaultValue={links.youtube}
            placeholder="https://youtube.com"
            onChange={onChangeLink}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Image')}</ControlLabel>
          <Uploader
            defaultFileList={image ? [image] : []}
            onChange={onChangeImage}
            single={true}
          />
        </FormGroup>
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
