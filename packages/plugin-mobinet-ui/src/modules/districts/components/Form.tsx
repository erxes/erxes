import LocationOption from '@erxes/ui-forms/src/settings/properties/components/LocationOption';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Toggle from '@erxes/ui/src/components/Toggle';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';

import Map from '../../../common/OSMap';
import { ToggleWrap } from '../../../styles';
import SelectCity from '../../cities/containers/SelectCity';
import { IDistrict } from '../types';

type Props = {
  district?: IDistrict;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const DistrictForm = (props: Props) => {
  const { district } = props;

  const [cityId, setCityId] = useState<string>(district ? district.cityId : '');

  const [districtObject, setDistrictObject] = useState<IDistrict | undefined>(
    district
  );

  const [center, setCenter] = useState(
    (district && district.center) || {
      lat: 47.919481,
      lng: 106.904299
    }
  );

  const generateDoc = () => {
    const finalValues: any = {};

    if (district) {
      finalValues._id = district._id;
    }

    if (districtObject) {
      finalValues.name = districtObject.name;
      finalValues.code = districtObject.code;
      finalValues.cityId = cityId;
      finalValues.center = { ...center };
    }

    return {
      ...finalValues
    };
  };

  const onChangeInput = e => {
    const { id, value } = e.target;
    const obj: any = districtObject || {};

    obj[id] = value;

    setDistrictObject(obj);
  };

  const onChangeToggle = e => {
    const obj: any = districtObject || {};

    obj.isCapital = e.target.checked;

    setDistrictObject(obj);

    console.log(districtObject);
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
          zoom={10}
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

    console.log(districtObject?.isCapital);

    return (
      <>
        <SelectCity
          defaultValue={cityId}
          onChange={e => {
            setCityId(e);
          }}
        />

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

        <ToggleWrap>
          <FormGroup>
            <ControlLabel>Is Capital</ControlLabel>
            <Toggle
              id="isCapital"
              checked={districtObject?.isCapital}
              onChange={onChangeToggle}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </FormGroup>
        </ToggleWrap>

        {renderMap()}

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
