import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
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
  tag?: any;
  website?: any;
  translations?: IPostTranslation[];
  onSubmit: (doc: any, translations?: IPostTranslation[]) => void;
  closeModal: () => void;
  refetch?: () => void;
};

const TagForm = (props: Props) => {
  const { website } = props;
  const [tag, setTag] = React.useState<any>(
    props.tag || {
      slug: '',
      name: '',
    }
  );

  const [currentLanguage, setCurrentLanguage] = React.useState(
    website.language
  );

  const [translations, setTranslations] = React.useState<IPostTranslation[]>(
    props.translations || []
  );

  React.useEffect(() => {}, [tag]);


  const onSave = () => {
    

    props.onSubmit({name: tag.name, slug: tag.slug}, translations);
  };

  const getName = () => {
    if (currentLanguage === website.language) {
      return tag.name;
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
        {/* {renderInput('name', 'text', tag.name, 'Name', true)} */}

        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'name'}
            name={'name'}
            type={'text'}
            required={true}
            defaultValue={getName()}
            value={getName()}
            onChange={(e: any) => {
              if (currentLanguage === website.language) {
                setTag({
                  ...tag,
                  name: e.target.value,
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
                      postId: tag._id,
                      type: 'tag',
                      language: currentLanguage,
                      content: e.target.value,
                    },
                  ]);
                }
              }
            }}
          />
        </FormGroup>

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

export default TagForm;
