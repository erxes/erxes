import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { MapContainer, ModalFooter } from '@erxes/ui/src/styles/main';
import {
  IButtonMutateProps,
  IFormProps,
  ILocationOption
} from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import { IPlace } from '../../types';
import { PROVINCES } from '../../constants';
import Select from 'react-select-plus';
import Map from '@erxes/ui/src/components/Map';
import LocationOption from '@erxes/ui-settings/src/properties/components/LocationOption';

type Props = {
  place?: IPlace;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const PlaceForm = (props: Props) => {
  const { place } = props;

  const [province, setProvince] = useState<string>(
    (place && place.province) || ''
  );

  const [name, setName] = useState<string>((place && place.name) || '');
  const [code, setCode] = useState<string>((place && place.code) || '');
  const [center, setCenter] = useState<ILocationOption>(
    (place && place.center) || { lat: 0, lng: 0, description: 'description' }
  );

  const [zoom, setZoom] = useState<number>((place && 10) || 7);

  const generateDoc = () => {
    const finalValues: any = {};

    if (place) {
      finalValues._id = place._id;
    }

    finalValues.name = name;
    finalValues.code = code;
    finalValues.center = center;
    finalValues.province = province;

    return {
      ...finalValues
    };
  };

  const onChangeProvince = option => {
    const selected = PROVINCES.find(p => p.value === option.value);
    setZoom(10);
    setCenter(selected.center);
    setProvince(option.value);
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    const onChangeLocation = option => {
      setCenter(option);
    };

    const onChangeInput = e => {
      const { id, value } = e.target;
      switch (id) {
        case 'name':
          setName(value);
          break;
        case 'code':
          setCode(value);
      }
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Province</ControlLabel>
          <Select
            placeholder={__('Select a province')}
            value={province}
            onChange={onChangeProvince}
            options={PROVINCES}
            multi={false}
            clearable={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <p>station name or place name</p>
          <FormControl
            {...formProps}
            id="name"
            name="name"
            type="string"
            required={true}
            defaultValue={name}
            onChange={onChangeInput}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Code</ControlLabel>
          <FormControl
            {...formProps}
            id="code"
            name="code"
            type="string"
            required={true}
            defaultValue={code}
            onChange={onChangeInput}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel htmlFor="locationOptions">Location:</ControlLabel>
          <MapContainer>
            <Map
              center={center}
              googleMapApiKey={localStorage.getItem('GOOGLE_MAP_API_KEY') || ''}
              defaultZoom={zoom}
              locationOptions={[]}
              mapControlOptions={{
                controlSize: 30,
                zoomControl: true,
                mapTypeControl: true,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: true
              }}
              isPreview={false}
              drawPolyLines={false}
              onChangeMarker={onChangeLocation}
            />
          </MapContainer>

          <LocationOption
            key={'location'}
            option={center}
            onChangeOption={onChangeLocation}
            index={0}
          />
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'places',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: place
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

export default PlaceForm;
