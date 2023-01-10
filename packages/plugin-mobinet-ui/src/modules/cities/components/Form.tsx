import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState, useEffect } from 'react';
import Map from '../../../common/OSMap';

import { ICity, IGeoData } from '../types';

type Props = {
  city?: ICity;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const CityForm = (props: Props) => {
  const { city } = props;
  const geoData = (city && city.geoData) || {
    lat: 47.919481,
    lng: 106.904299,
    zoom: 10
  };

  console.log('geoData', geoData);

  const [cityObject, setCityObject] = useState<ICity | undefined>(city);
  const [lat, setLat] = useState<number>((geoData && geoData.lat) || 0);
  const [lng, setLng] = useState<number>(geoData.lng);
  const [zoom, setZoom] = useState<number>(geoData.zoom);

  // useEffect(() => {
  //   console.log('geoData', geoData);
  // }, [geoData]);

  const generateDoc = () => {
    const finalValues: any = {};

    if (city) {
      finalValues._id = city._id;
    }

    if (cityObject) {
      finalValues.name = cityObject.name;
      finalValues.code = cityObject.code;
      finalValues.geoData = geoData;
      finalValues.iso = cityObject.iso;
      finalValues.stat = cityObject.stat;
    }

    return {
      ...finalValues
    };
  };

  const onChangeInput = e => {
    const { id, value } = e.target;

    // if (['lat', 'lng', 'zoom'].includes(id)) {
    //   const data: IGeoData = geoData || { lat: 0, lng: 0, zoom: 10 };

    //   data[id] = Number(value);

    //   return setGeoData(data);
    // }

    switch (id) {
      case 'lat':
        setLat(Number(value));
        return;
      case 'lng':
        setLng(Number(value));
        return;
      case 'zoom':
        setZoom(Number(value));
        return;
      default:
        break;
    }

    const obj: any = cityObject || {};

    obj[id] = value;

    setCityObject(obj);
  };

  const onChangeCenter = position => {
    console.log(position);

    // setGeoData(position);
    setLat(position.lat);
    setLng(position.lng);
  };

  const renderInput = (formProps, title, name, type, value) => {
    console.log('renderInput', name, value);
    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        <FormControl
          {...formProps}
          id={name}
          name={name}
          type={type}
          required={true}
          defaultValue={value}
          onChange={onChangeInput}
        />
      </FormGroup>
    );
  };

  const renderMap = () => {
    console.log('renderMap');
    return (
      <FormGroup>
        <ControlLabel htmlFor="locationOptions">Location:</ControlLabel>
        <Map
          id={Math.random().toString(10)}
          height={'300px'}
          center={geoData}
          zoom={geoData && geoData.zoom}
          addMarkerOnCenter={true}
          onChangeCenter={onChangeCenter}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    console.log('**********', geoData);

    return (
      <>
        {renderInput(formProps, 'Code', 'code', 'string', city && city.code)}
        {renderInput(formProps, 'Name', 'name', 'string', city && city.name)}

        {renderInput(formProps, 'Iso', 'iso', 'string', city && city.iso)}
        {renderInput(formProps, 'Stat', 'stat', 'string', city && city.stat)}
        {renderInput(
          formProps,
          'Latitude',
          'lat',
          'number',
          (geoData && geoData.lat) || 0
        )}
        {renderInput(
          formProps,
          'Longitude',
          'lng',
          'number',
          (geoData && geoData.lng) || 0
        )}
        {renderInput(
          formProps,
          'Zoom',
          'zoom',
          'number',
          (geoData && geoData.zoom) || 10
        )}

        {renderMap()}

        {/* <FormGroup>
            <ControlLabel required={true}>Province</ControlLabel>
            <Select
              cityholder={__('Select a province')}
              value={province}
              onChange={onChangeProvince}
              options={PROVINCES}
              multi={false}
              clearable={true}
            />
          </FormGroup> */}
        {/* 
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
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
        </FormGroup> */}

        {/* <FormGroup>
            <ControlLabel htmlFor="locationOptions">Location:</ControlLabel>
            <Map
              id={Math.random().toString(10)}
              center={center}
              zoom={zoom}
              locationOptions={[]}
              streetViewControl={false}
              onChangeMarker={onChangeMarker}
              mode="view"
            />
            <LocationOption
              key={'location'}
              option={center}
              onChangeOption={onChangeLocationOption}
              index={0}
            />
          </FormGroup> */}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'citys',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: city
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default CityForm;
