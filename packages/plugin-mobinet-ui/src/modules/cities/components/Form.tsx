import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import Map from '../../../common/OpenStreetMapBuildings';

import { ICity } from '../types';

type Props = {
  city?: ICity;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const CityForm = (props: Props) => {
  const { city } = props;

  // const [name, setName] = useState<string>((city && city.name) || '');
  // const [code, setCode] = useState<string>((city && city.code) || '');
  // const [center, setCenter] = useState<ILocationOption>(
  //   (city && city.center) || { lat: 0, lng: 0, description: 'description' }
  // );
  // const [iso, setIso] = useState<string>((city && city.iso) || '');
  // const [stat, setStat] = useState<string>((city && city.stat) || '');

  const [cityObject, setCityObject] = useState<ICity | undefined>(city);

  const generateDoc = () => {
    const finalValues: any = {};

    if (city) {
      finalValues._id = city._id;
    }

    if (cityObject) {
      finalValues.name = cityObject.name;
      finalValues.code = cityObject.code;
      finalValues.center = cityObject.center;
      finalValues.iso = cityObject.iso;
      finalValues.stat = cityObject.stat;
    }

    return {
      ...finalValues
    };
  };

  // const onChangeProvince = option => {
  //   const selected = PROVINCES.find(p => p.value === option.value);

  //   if (!selected) {
  //     return;
  //   }

  //   setZoom(10);
  //   setCenter(selected.center);
  //   setProvince(option.value);
  // };

  // const onChangeMarker = (option) => {
  //   setCenter(option);
  // };

  // const onChangeLocationOption = (option) => {
  //   setCenter(option);
  // };

  const onChangeInput = e => {
    const { id, value } = e.target;
    const obj: any = cityObject || {};

    obj[id] = value;

    setCityObject(obj);
  };

  const renderInput = (formProps, title, name, type, value) => {
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
    return (
      <FormGroup>
        <ControlLabel htmlFor="locationOptions">Location:</ControlLabel>
        {/* <Map
          id={Math.random().toString(10)}
          center={cityObject && cityObject.center}

        /> */}
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    return (
      <>
        {renderInput(formProps, 'Code', 'code', 'string', city && city.code)}
        {renderInput(formProps, 'Name', 'name', 'string', city && city.name)}

        {renderInput(formProps, 'Iso', 'iso', 'string', city && city.iso)}
        {renderInput(formProps, 'Stat', 'stat', 'string', city && city.stat)}

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
