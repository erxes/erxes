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
import CustomPostTypeGroup from '../../fieldGroups/CustomPostTypeGroup';

type Props = {
  clientPortalId: string;
  category?: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  refetch?: () => void;
};

const ProductForm = (props: Props) => {
  const { clientPortalId } = props;
  const [category, setCategory] = React.useState<any>(
    props.category || {
      slug: '',
      name: '',
      description: '',
      status: 'active',
      parentId: '',
    }
  );

  const generateDoc = () => {
    const finalValues: any = {};
    const keysToDelete = ['__typename', '_id', 'createdAt', 'parent', 'children'];
    Object.keys(category).forEach((key) => {
      if (keysToDelete.indexOf(key) !== -1) {
        return;
      }

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

    const renderFormFields = () => {
      if (!clientPortalId || !clientPortalId.length) {
        return null;
      }
      return (
        <>
          <FormGroup>
            <ControlLabel>{__('Name')}</ControlLabel>
            <FormControl
              {...formProps}
              id={'name'}
              name={'name'}
              required={true}
              defaultValue={category.name}
              value={category.name}
              onChange={(e: any) => {
                const nameValue = e.target.value;
                const slugValue = nameValue
                  .toLowerCase()
                  .trim()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]+/g, '')
                  .replace(/-+/g, '-');

                setCategory({
                  ...category,
                  name: nameValue,
                  slug: slugValue,
                });
              }}
            />
          </FormGroup>
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
              clientPortalId={clientPortalId}
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

          {props.category && (
            <FormGroup>
              <ControlLabel>{__('Custom Fields')}</ControlLabel>
              <div style={{ paddingTop: 10 }}>
              <CustomPostTypeGroup
                clientPortalId={clientPortalId}
                category={category}
                customFieldsData={category.customFieldsData || []} 
                onChange={(field, value) => {
                  setCategory({
                    ...category,
                    [field]: value,
                  });
                }}
              />
              </div>
            </FormGroup>
          )}

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

    return <>{renderFormFields()}</>;
  };

  return <Form renderContent={renderContent} />;
};

export default ProductForm;
