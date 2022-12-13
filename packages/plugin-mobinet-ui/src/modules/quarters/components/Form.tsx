import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import SelectCity from '../../cities/containers/SelectCity';
import SelectDistrict from '../../districts/containers/SelectDistrict';

import { IQuarter } from '../types';

type Props = {
  quarter?: IQuarter;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const QuarterForm = (props: Props) => {
  const { quarter } = props;

  // const [name, setName] = useState<string>((quarter && quarter.name) || '');
  // const [code, setCode] = useState<string>((quarter && quarter.code) || '');
  // const [center, setCenter] = useState<ILocationOption>(
  //   (quarter && quarter.center) || { lat: 0, lng: 0, description: 'description' }
  // );
  // const [iso, setIso] = useState<string>((quarter && quarter.iso) || '');
  // const [stat, setStat] = useState<string>((quarter && quarter.stat) || '');
  const [cityId, setCityId] = useState<string>(
    (quarter && quarter.cityId) || ''
  );
  const [districtId, setDistrictId] = useState<string>(
    (quarter && quarter.districtId) || ''
  );

  const [quarterObject, setQuarterObject] = useState<IQuarter | undefined>(
    quarter
  );

  const generateDoc = () => {
    const finalValues: any = {};

    if (quarter) {
      finalValues._id = quarter._id;
    }

    if (quarterObject) {
      finalValues.name = quarterObject.name;
      finalValues.code = quarterObject.code;
      finalValues.center = quarterObject.center;
      //   finalValues.iso = quarterObject.iso;
      //   finalValues.stat = quarterObject.stat;
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
    const obj: any = quarterObject || {};

    obj[id] = value;

    setQuarterObject(obj);
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
            setCityId(e);
          }}
        />

        {cityId && (
          <SelectDistrict
            defaultValue={districtId}
            cityId={cityId}
            onChange={e => {
              setDistrictId(e);
            }}
          />
        )}

        {renderInput(
          formProps,
          'Code',
          'code',
          'string',
          quarter && quarter.code
        )}
        {renderInput(
          formProps,
          'Name',
          'name',
          'string',
          quarter && quarter.name
        )}

        {/* {renderInput(formProps, 'Iso', 'iso', 'string', quarter && quarter.iso)} */}
        {/* {renderInput(formProps, 'Stat', 'stat', 'string', quarter && quarter.stat)} */}

        {/* <FormGroup>
            <ControlLabel required={true}>Province</ControlLabel>
            <Select
              quarterholder={__('Select a province')}
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
            name: 'quarters',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: quarter
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default QuarterForm;
