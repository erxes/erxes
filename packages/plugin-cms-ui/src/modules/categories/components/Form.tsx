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
import { IPostTranslation } from '../../../types';

type Props = {
  clientPortalId: string;
  category?: any;
  website?: any;
  translations?: IPostTranslation[];
  // renderButton: (props: IButtonMutateProps) => JSX.Element;
  onSubmit: (doc: any, translations?: IPostTranslation[]) => void;
  closeModal: () => void;
  refetch?: () => void;
};

const ProductForm = (props: Props) => {
  const { clientPortalId, website } = props;
  const [category, setCategory] = React.useState<any>(
    props.category || {
      slug: '',
      name: '',
      description: '',
      status: 'active',
      parentId: '',
    }
  );

  const [currentLanguage, setCurrentLanguage] = React.useState(
    website.language
  );

  const [translations, setTranslations] = React.useState<IPostTranslation[]>(
    props.translations || []
  );

  const generateDoc = () => {
    const finalValues: any = {};
    const keysToDelete = [
      '__typename',
      '_id',
      'createdAt',
      'parent',
      'children',
    ];
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
      clientPortalId,
    };
  };

  const onSave = () => {
    const doc = generateDoc();
    
    props.onSubmit(doc, translations);
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal } = props;
    const { isSubmitted } = formProps;

    const keyMap = {
      name: 'title',
      description: 'content',
    };

    const getValue = (key: string) => {
      if (currentLanguage === website.language) {
        return category[key];
      }

      const translation = translations.find(
        (t) => t.language === currentLanguage
      );

      return translation ? translation[keyMap[key]] : '';
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
          {website.languages.length > 1 && (
            <FormGroup>
              <ControlLabel>{__('Language')}</ControlLabel>
              <FormControl
                {...formProps}
                id={'language'}
                name={'language'}
                componentclass='select'
                placeholder={__('Select language')}
                required={true}
                defaultValue={currentLanguage}
                value={currentLanguage}
                onChange={(e: any) => {
                  setCurrentLanguage(e.target.value);
                }}
                options={website.languages.map((lang) => ({
                  value: lang,
                  label: lang,
                }))}
              />
            </FormGroup>
          )}

          <FormGroup>
            <ControlLabel>{__('Name')}</ControlLabel>
            <FormControl
              {...formProps}
              id={'name'}
              name={'name'}
              required={true}
              defaultValue={getValue('name')}
              value={getValue('name')}
              onChange={(e: any) => {
                const nameValue = e.target.value;
                const slugValue = nameValue
                  .toLowerCase()
                  .trim()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]+/g, '')
                  .replace(/-+/g, '-');

                if (currentLanguage === website.language) {
                  setCategory({
                    ...category,
                    name: nameValue,
                    slug: slugValue,
                  });
                } else {
                  const translation = translations.find(
                    (t) => t.language === currentLanguage
                  );

                  if (translation) {
                    setTranslations(
                      translations.map((t) =>
                        t.language === currentLanguage
                          ? {
                              ...t,
                              title: nameValue,
                            }
                          : t
                      )
                    );
                  } else {
                    setTranslations([
                      ...translations,
                      {
                        content: '',
                        excerpt: '',
                        customFieldsData: {},
                        postId: category._id,
                        type: 'category',
                        language: currentLanguage,
                        title: nameValue,
                      },
                    ]);
                  }
                }
              }}
            />
          </FormGroup>
          {renderInput('slug', 'text', category.slug, 'Slug', true)}
          <FormGroup>
            <ControlLabel>{__('Description')}</ControlLabel>
            <FormControl
              {...formProps}
              id={'description'}
              name={'description'}
              required={true}
              defaultValue={getValue('description')}
              value={getValue('description')}
              onChange={(e: any) => {
               
                if (currentLanguage === website.language) {
                  setCategory({
                    ...category,
                    description: e.target.value,
                  });
                } else {
                  const translation = translations.find(
                    (t) => t.language === currentLanguage
                  );

                  if (translation) {
                    setTranslations(
                      translations.map((t) =>
                        t.language === currentLanguage
                          ? {
                              ...t,
                              content: e.target.value,
                            }
                          : t
                      )
                    );
                  } else {
                    setTranslations([
                      ...translations,
                      {
                        title: '',
                        excerpt: '',
                        customFieldsData: {},
                        postId: category._id,
                        type: 'category',
                        language: currentLanguage,
                        content: e.target.value,
                      },
                    ]);
                  }
                }
              }}
            />
          </FormGroup>
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

            <Button btnStyle='success' type='submit' icon='check-circle' onClick={onSave}>
              Save
            </Button>
          </ModalFooter>
        </>
      );
    };

    return <>{renderFormFields()}</>;
  };

  return <Form renderContent={renderContent} />;
};

export default ProductForm;
