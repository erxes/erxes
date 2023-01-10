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
