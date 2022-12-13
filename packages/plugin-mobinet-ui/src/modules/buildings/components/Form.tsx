import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import SelectCity from '../../cities/containers/SelectCity';

import { IBuilding } from '../types';

type Props = {
  building?: IBuilding;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const BuildingForm = (props: Props) => {
  const { building } = props;

  // const [name, setName] = useState<string>((building && building.name) || '');
  // const [code, setCode] = useState<string>((building && building.code) || '');
  // const [center, setCenter] = useState<ILocationOption>(
  //   (building && building.center) || { lat: 0, lng: 0, description: 'description' }
  // );
  // const [iso, setIso] = useState<string>((building && building.iso) || '');
  // const [stat, setStat] = useState<string>((building && building.stat) || '');

  const [quarterId, setQuarterId] = useState<string>('');
  const [cityId, setCityId] = useState<string>('');
  const [districtId, setDistrictId] = useState<string>('');

  const [buildingObject, setBuildingObject] = useState<IBuilding | undefined>(
    building
  );

  const generateDoc = () => {
    const finalValues: any = {};

    if (building) {
      finalValues._id = building._id;
    }

    if (buildingObject) {
      finalValues.name = buildingObject.name;
      finalValues.code = buildingObject.code;
      finalValues.center = buildingObject.center;
      //   finalValues.iso = buildingObject.iso;
      //   finalValues.stat = buildingObject.stat;
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
    const obj: any = buildingObject || {};

    obj[id] = value;

    setBuildingObject(obj);
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
        <SelectCity
          multi={false}
          defaultValue={[cityId]}
          isRequired={true}
          onChange={e => {
            setCityId(e);
          }}
        />
        {renderInput(
          formProps,
          'Code',
          'code',
          'string',
          building && building.code
        )}
        {renderInput(
          formProps,
          'Name',
          'name',
          'string',
          building && building.name
        )}

        {/* {renderInput(formProps, 'Iso', 'iso', 'string', building && building.iso)} */}
        {/* {renderInput(formProps, 'Stat', 'stat', 'string', building && building.stat)} */}

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
            name: 'buildings',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: building
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default BuildingForm;
