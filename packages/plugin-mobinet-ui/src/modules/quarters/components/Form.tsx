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
import { IDistrict } from '../../districts/types';

import { IQuarter } from '../types';

type Props = {
  quarter?: IQuarter;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const QuarterForm = (props: Props) => {
  const { quarter } = props;

  const [cityId, setCityId] = useState<string>(
    (quarter && quarter.district && quarter.district.city._id) || ''
  );

  const [districtId, setDistrictId] = useState<string>(
    (quarter && quarter.districtId) || ''
  );

  const [quarterObject, setQuarterObject] = useState<IQuarter | undefined>(
    quarter
  );

  React.useEffect(() => {}, [setCityId, cityId, districtId]);

  const generateDoc = () => {
    const finalValues: any = {};

    if (quarter) {
      finalValues._id = quarter._id;
    }

    if (quarterObject) {
      finalValues.name = quarterObject.name;
      finalValues.code = quarterObject.code;
      finalValues.center = quarterObject.center;
      finalValues.districtId = districtId;
    }

    return {
      ...finalValues
    };
  };

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
            setDistrictId('');
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
