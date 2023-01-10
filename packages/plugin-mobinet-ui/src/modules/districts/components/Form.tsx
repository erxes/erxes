import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';

import { IDistrict } from '../types';
import SelectCity from '../../cities/containers/SelectCity';

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

  const generateDoc = () => {
    const finalValues: any = {};

    if (district) {
      finalValues._id = district._id;
    }

    if (districtObject) {
      finalValues.name = districtObject.name;
      finalValues.code = districtObject.code;
      finalValues.cityId = cityId;
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
