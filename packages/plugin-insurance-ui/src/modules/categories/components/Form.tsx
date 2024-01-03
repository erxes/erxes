import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import { InsuranceCategory } from '../../../gql/types';
import SelectRisks from '../../risks/containers/SelectRisks';

type Props = {
  category?: InsuranceCategory;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const ProductForm = (props: Props) => {
  const [category, setCategory] = React.useState<any>(
    props.category || { code: '', name: '', description: '', riskIds: [] }
  );

  const generateDoc = () => {
    const finalValues: any = {};

    if (props.category) {
      finalValues._id = props.category._id;
    }

    Object.keys(category).forEach(key => {
      if (category[key] !== undefined) {
        finalValues[key] = category[key];
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
      required?: boolean,
      useNumberFormat?: boolean
    ) => {
      const onChangeInput = (e: any) => {
        setCategory({
          ...category,
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
            useNumberFormat={useNumberFormat}
            defaultValue={value}
            value={value}
            onChange={onChangeInput}
          />
        </FormGroup>
      );
    };

    return (
      <>
        {renderInput('code', 'text', category.code, 'Code', true)}
        {renderInput('name', 'text', category.name, 'Name', true)}
        {renderInput(
          'description',
          'text',
          category.description,
          'Description'
        )}
        <FormGroup>
          <ControlLabel>{__('Risks')}</ControlLabel>
          <SelectRisks
            label="Risks"
            name="risks"
            onSelect={(values: string[] | string) => {
              setCategory({
                ...category,
                riskIds: values
              });
            }}
            initialValue={category.riskIds}
          />
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'category',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: category
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ProductForm;
