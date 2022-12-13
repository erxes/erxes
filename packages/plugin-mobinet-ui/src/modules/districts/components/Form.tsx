import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';

import { IDistrict } from '../types';

type Props = {
  district?: IDistrict;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const DistrictForm = (props: Props) => {
  const { district } = props;

  // const [name, setName] = useState<string>((district && district.name) || '');
  // const [code, setCode] = useState<string>((district && district.code) || '');
  // const [center, setCenter] = useState<ILocationOption>(
  //   (district && district.center) || { lat: 0, lng: 0, description: 'description' }
  // );
  // const [iso, setIso] = useState<string>((district && district.iso) || '');
  // const [stat, setStat] = useState<string>((district && district.stat) || '');

  const [districtObject, setDistrictObject] = useState<IDistrict | undefined>(
    district
  );

  const generateDoc = () => {
    const finalValues: any = {};

    if (district) {
      finalValues._id = district._id;
    }

    if (districtObject) {
      finalValues.name = districtObject.name;
      finalValues.code = districtObject.code;
      finalValues.center = districtObject.center;
      //   finalValues.iso = districtObject.iso;
      //   finalValues.stat = districtObject.stat;
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
    const obj: any = districtObject || {};

    obj[id] = value;

    setDistrictObject(obj);
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

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    return (
      <>
        {renderInput(
          formProps,
          'Code',
          'code',
          'string',
          district && district.code
        )}
        {renderInput(
          formProps,
          'Name',
          'name',
          'string',
          district && district.name
        )}

        {/* {renderInput(formProps, 'Iso', 'iso', 'string', district && district.iso)} */}
        {/* {renderInput(formProps, 'Stat', 'stat', 'string', district && district.stat)} */}

        {/* <FormGroup>
            <ControlLabel required={true}>Province</ControlLabel>
            <Select
              districtholder={__('Select a province')}
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
            name: 'districts',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: district
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default DistrictForm;
