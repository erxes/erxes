import { IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import { IPostTranslation } from '../../../types';
import CustomPostTypeGroup from '../../fieldGroups/CustomPostTypeGroup';

type Props = {
  clientPortalId: string;
  page?: any;
  website?: any;
  translations?: IPostTranslation[];
  onSubmit: (doc: any, translations?: IPostTranslation[]) => void;
  closeModal: () => void;
  refetch?: () => void;
};

const ProductForm = (props: Props) => {
  const { website } = props;
  const [currentLanguage, setCurrentLanguage] = React.useState(
    website.language
  );

  const [translations, setTranslations] = React.useState<IPostTranslation[]>(
    props.translations || []
  );

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
    const keysToDelete = [
      '__typename',
      '_id',
      'createdAt',
      'createdUser',
      'updatedAt',
      'createdUserId',
    ];
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

  const onSave = () => {
    props.onSubmit(generateDoc(), translations);
  };

  const getName = () => {
    if (currentLanguage === website.language) {
      return page.name;
    }

    const translation = translations.find(
      (t) => t.language === currentLanguage
    );

    return translation ? translation.title : '';
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
        return page[key];
      }

      const translation = translations.find(
        (t) => t.language === currentLanguage
      );

      return translation ? translation[keyMap[key]] : '';
    };

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
                setPage({
                  ...page,
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

                      postId: page._id,
                      type: 'page',
                      language: currentLanguage,
                      title: nameValue,
                    },
                  ]);
                }
              }
            }}
          />
        </FormGroup>

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
                setPage({
                  ...page,
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

                      postId: page._id,
                      type: 'page',
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
          <Button
            btnStyle='success'
            type='submit'
            icon='check-circle'
            disabled={isSubmitted}
            onClick={onSave}
          >
            {isSubmitted ? 'Saving' : 'Save'}
          </Button>
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ProductForm;
