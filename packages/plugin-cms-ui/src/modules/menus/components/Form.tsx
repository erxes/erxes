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

type Props = {
  clientPortalId: string;
  menu?: any;
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

  const [menu, setMenu] = React.useState<any>(
    props.menu || {
      label: '',
      url: '',
      kind: '',
    }
  );

  React.useEffect(() => {}, [menu]);

  const generateDoc = () => {
    const finalValues: any = {};
    const keysToDelete = ['__typename', '_id'];
    Object.keys(menu).forEach((key) => {
      if (keysToDelete.indexOf(key) !== -1) {
        return;
      }

      if (menu[key] !== undefined) {
        finalValues[key] = menu[key];
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
      return menu.label;
    }

    const translation = translations.find(
      (t) => t.language === currentLanguage
    );

    return translation ? translation.title : '';
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal } = props;
    const { isSubmitted } = formProps;

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
          <ControlLabel>{__('Label')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'label'}
            name={'label'}
            required={true}
            defaultValue={getName()}
            value={getName()}
            onChange={(e: any) => {
              const nameValue = e.target.value;
              const slugValue = nameValue
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]+/g, '')
                .replace(/-+/g, '-');

              if (currentLanguage === website.language) {
                setMenu({
                  ...menu,
                  label: e.target.value,
                  url: slugValue,
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
                            title: e.target.value,
                          }
                        : t
                    )
                  );
                } else {
                  setTranslations([
                    ...translations,
                    {
                      title: e.target.value,
                      excerpt: e.target.value,
                      customFieldsData: {},
                      postId: menu._id,
                      type: 'menu',
                      language: currentLanguage,
                      content: e.target.value,
                    },
                  ]);
                }
              }
            }}
          />
        </FormGroup>

        {website.language === currentLanguage && (
          <>
            <FormGroup>
              <ControlLabel>{__('URL')}</ControlLabel>
              <FormControl
                {...formProps}
                id={'url'}
                name={'url'}
                required={true}
                defaultValue={menu.url}
                value={menu.url}
                onChange={(e: any) => {
                  setMenu({
                    ...menu,
                    url: `${e.target.value}`,
                  });
                }}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>{__('Kind')}</ControlLabel>
              <FormControl
                {...formProps}
                id={'kind'}
                name={'kind'}
                required={true}
                defaultValue={menu.kind}
                value={menu.kind}
                onChange={(e: any) => {
                  setMenu({
                    ...menu,
                    kind: e.target.value,
                  });
                }}
              />
            </FormGroup>
          </>
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
