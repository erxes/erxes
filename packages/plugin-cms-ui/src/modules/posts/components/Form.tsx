import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';

import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';

type Props = {
  post?: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const ProductForm = (props: Props) => {
  const [post, setPost] = React.useState<any>(
    props.post || {
      title: '',
    }
  );

  const generateDoc = () => {
    const finalValues: any = {};

    if (props.post) {
      finalValues._id = props.post._id;
    }

    Object.keys(post).forEach((key) => {
      if (post[key] !== undefined) {
        finalValues[key] = post[key];
      }
    });

    console.log('finalValues', finalValues);

    return {
      ...finalValues,
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    const onSelectCompanies = (value: any) => {
      setPost({
        ...post,
        companyIds: value,
      });
    };

    const renderInput = (
      name: string,
      type: string,
      value: any,
      label: string,
      required?: boolean,
      useNumberFormat?: boolean
    ) => {
      const onChangeInput = (e: any) => {
        setPost({
          ...post,
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
        {renderInput('name', 'text', post.title, 'Name', true)}
        {renderInput(
          'description',
          'text',
          post.content,
          'Description'
        )}

        <FormGroup>
          <ControlLabel>Status</ControlLabel>
          <br />
          {/* <FormControl
            className='toggle-message'
            componentclass='checkbox'
            checked={category.status === 'active'}
            onChange={(e: any) => {
              setCategory({
                ...category,
                status: e.target.checked ? 'active' : 'inactive',
              });
            }}
          >
            {__('Check to activate')}.
          </FormControl> */}
        </FormGroup>

        <ModalFooter>
          <Button btnStyle='simple' onClick={closeModal} icon='times-circle'>
            Close
          </Button>

          {renderButton({
            name: 'post',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: post,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ProductForm;
