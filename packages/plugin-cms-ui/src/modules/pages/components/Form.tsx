import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomPostTypeGroup from '../../fieldGroups/CustomPostTypeGroup';

type Props = {
  clientPortalId: string;
  page?: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  refetch?: () => void;
};

const ProductForm = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = React.useState<any>(
    props.page || {
      slug: '',
      name: '',
      status: 'active',
    }
  );

  React.useEffect(() => {}, [page]);

  const generateDoc = () => {
    const finalValues: any = {};
    const keysToDelete = ['__typename', '_id', 'createdAt', 'createdUser', 'updatedAt','createdUserId'];
    Object.keys(page).forEach((key) => {
      if (keysToDelete.indexOf(key) !== -1) {
        return;
      }

      if (page[key] !== undefined) {
        finalValues[key] = page[key];
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
        if (name === 'name') {
          setPage({
            ...page,
            name: e.target.value,
            slug: `${e.target.value}`,
          });
        }

        setPage({
          ...page,
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
        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'name'}
            name={'name'}
            required={true}
            defaultValue={page.name}
            value={page.name}
            onChange={(e: any) => {
              const nameValue = e.target.value;
              const slugValue = nameValue
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]+/g, '')
                .replace(/-+/g, '-');

              setPage({
                ...page,
                name: nameValue,
                slug: slugValue,
              });
            }}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Path')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'path'}
            name={'path'}
            required={true}
            defaultValue={page.slug}
            value={page.slug}
            onChange={(e: any) => {
              setPage({
                ...page,
                slug: `${e.target.value}`,
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
            defaultValue={page.status || 'inactive'}
            required={true}
            onChange={(e: any) => {
              setPage({
                ...page,
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

        {props.page && (
          <FormGroup>
            <ControlLabel>{__('Custom Fields')}</ControlLabel>
            <div style={{ paddingTop: 10 }}>
              <CustomPostTypeGroup
                clientPortalId={props.clientPortalId}
                page={page}
                customFieldsData={page.customFieldsData || []}
                onChange={(field, value) => {
                  setPage({
                    ...page,
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
            name: 'page',
            values: generateDoc(),
            isSubmitted,
            callback: () => {
              if (props.refetch) {
                props.refetch();
              }

              closeModal();
            },
            object: page,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ProductForm;
