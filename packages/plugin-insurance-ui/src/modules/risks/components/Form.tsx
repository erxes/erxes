import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { Risk } from '../../../types.b';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  risk?: Risk;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  refetch?: () => void;
};

const RiskForm = (props: Props) => {
  const [risk, setRisk] = React.useState<any>(
    props.risk || { code: '', name: '', description: '' }
  );

  const generateDoc = () => {
    const finalValues: any = {};

    if (props.risk) {
      finalValues._id = props.risk._id;
    }

    Object.keys(risk).forEach(key => {
      if (risk[key] !== undefined) {
        finalValues[key] = risk[key];
      }
    });

    return {
      ...finalValues
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    const renderInput = (
      name: string,
      type: string,
      value: any,
      label: string,
      required?: boolean
    ) => {
      const onChangeInput = (e: any) => {
        setRisk({
          ...risk,
          [name]: e.target.value
        });
      };

      return (
        <FormGroup>
          <ControlLabel>{__(label)}</ControlLabel>
          <FormControl
            {...formProps}
            id={name}
            name={name}
            type={type}
            required={required}
            defaultValue={value}
            onChange={onChangeInput}
          />
        </FormGroup>
      );
    };

    return (
      <>
        {renderInput('code', 'text', risk.code, 'Code', true)}
        {renderInput('name', 'text', risk.name, 'Name', true)}
        {renderInput('description', 'text', risk.description, 'Description')}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'risk',
            values: generateDoc(),
            isSubmitted,
            callback: () => {
              closeModal();
              if (props.refetch) {
                props.refetch();
              }
            },
            object: risk
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default RiskForm;
