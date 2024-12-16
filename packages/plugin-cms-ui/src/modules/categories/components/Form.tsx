import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import SelectCategory from '../containers/SelectCategory';

type Props = {
  clientPortalId: string;
  category?: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  refetch?: () => void;
};

const ProductForm = (props: Props) => {
  const [category, setCategory] = React.useState<any>(
    props.category || {
      slug: '',
      name: '',
      description: '',
      status: 'active',
      parentId: '',
    }
  );

  React.useEffect(() => {}, [category]);

  const generateDoc = () => {
    const finalValues: any = {};

    if (props.category) {
      finalValues._id = props.category._id;
    }

    Object.keys(category).forEach((key) => {
      if (category[key] !== undefined) {
        finalValues[key] = category[key];
      }
    });

    return {
      ...finalValues,
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
          [name]: e.target.value,
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
        {renderInput('name', 'text', category.name, 'Name', true)}
        {renderInput('slug', 'text', category.slug, 'Slug', true)}
        {renderInput(
          'description',
          'text',
          category.description,
          'Description'
        )}
        <FormGroup>
          <ControlLabel>{__('Parent Category')}</ControlLabel>
          <SelectCategory
            clientPortalId={props.clientPortalId}
            value={category.parentId}
            onChange={(catId) => {
              setCategory({
                ...category,
                parentId: catId,
              });
            }}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Status')}</ControlLabel>

          <FormControl
            name='status'
            componentclass='select'
            placeholder={__('Select status')}
            defaultValue={category.status || 'inactive'}
            required={true}
            onChange={(e: any) => {
              setCategory({
                ...category,
                status: e.target.value,
              });
            }}
          >
            {['active', 'inactive'].map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <ModalFooter>
          <Button btnStyle='simple' onClick={closeModal} icon='times-circle'>
            Close
          </Button>

          {renderButton({
            name: 'category',
            values: generateDoc(),
            isSubmitted,
            callback: () => {
              if (props.refetch) {
                props.refetch();
              }

              closeModal();
            },
            object: category,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ProductForm;
