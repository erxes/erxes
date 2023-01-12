import LocationOption from '@erxes/ui-forms/src/settings/properties/components/LocationOption';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useEffect, useState } from 'react';

import Map from '../../../common/OSMap';
import { ICity } from '../types';

type Props = {
  city?: ICity;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const CityForm = (props: Props) => {
  const { city } = props;

  const [cityObject, setCityObject] = useState<ICity | undefined>(city);

  const [center, setCenter] = useState(
    (city && city.center) || {
      lat: 47.919481,
      lng: 106.904299
    }
  );

  useEffect(() => {}, [center]);

  const generateDoc = () => {
    const finalValues: any = {};

    if (city) {
      finalValues._id = city._id;
    }

    if (cityObject) {
      finalValues.name = cityObject.name;
      finalValues.code = cityObject.code;
      finalValues.center = { ...center };
      finalValues.iso = cityObject.iso;
      finalValues.stat = cityObject.stat;
    }

    return {
      ...finalValues
    };
  };

  const onChangeInput = e => {
    const { id, value } = e.target;

    const obj: any = cityObject || {};

    obj[id] = value;

    setCityObject(obj);
  };

  const onChangeCenter = position => {
    setCenter(position);
  };

  const onChangeLocationOption = option => {
    setCenter(option);
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
        <Map
          id={Math.random().toString(10)}
          height={'300px'}
          center={center}
          zoom={7}
          addMarkerOnCenter={true}
          onChangeCenter={onChangeCenter}
        />

        <LocationOption
          key={'location'}
          option={center}
          onChangeOption={onChangeLocationOption}
          index={0}
        />
        {/* <ControlLabel htmlFor="zoom">{__('Zoom level')}:</ControlLabel>
          <FormControl
            id="zoom"
            defaultValue={zoom}
            value={zoom}
            name="zoom"
            type="number"
            onChange={onChangeInput}
          /> */}
        {/* </LocationOption> */}
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

        {renderMap()}

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
