import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState, useEffect } from 'react';
import SelectCity from '../../cities/containers/SelectCity';
import { ICity } from '../../cities/types';
import SelectDistrict from '../../districts/containers/SelectDistrict';
import SelectQuarter from '../../quarters/containers/SelectQuarter';

import { IBuilding } from '../types';

type Props = {
  city?: ICity;
  building?: IBuilding;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const BuildingForm = (props: Props) => {
  console.log('props', props);

  const { building } = props;

  const [quarterId, setQuarterId] = useState<string>('');
  const [cityId, setCityId] = useState<string | undefined>(
    props.city && props.city._id
    // ||
    //   (building &&
    //     building.quarter &&
    //     building.quarter.district &&
    //     building.quarter.district.cityId) ||
    //   ''
  );

  console.log('cityId', cityId);

  const [districtId, setDistrictId] = useState<string>('');

  const [buildingObject, setBuildingObject] = useState<IBuilding | undefined>(
    building
  );

  useEffect(() => {
    if (props.city) {
      setCityId(props.city._id);
    }
  }, [props.city, cityId]);

  const generateDoc = () => {
    const finalValues: any = {};

    if (building) {
      finalValues._id = building._id;
    }

    if (buildingObject) {
      finalValues.name = buildingObject.name;
      finalValues.code = buildingObject.code;
      finalValues.center = buildingObject.center;
    }

    return {
      ...finalValues
    };
  };

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
          defaultValue={cityId}
          onChange={e => {
            console.log('cityyyyyy ', e);
            setCityId(e);
            setDistrictId('');
          }}
        />

        {cityId && (
          <SelectDistrict
            cityId={cityId}
            defaultValue={districtId}
            onChange={e => {
              console.log('districttttt ', e);
              setDistrictId(e);
            }}
          />
        )}

        {districtId && (
          <SelectQuarter
            districtId={districtId}
            defaultValue={quarterId}
            onChange={e => {
              console.log('quarterrrrr ', e);
              setQuarterId(e);
            }}
          />
        )}

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
