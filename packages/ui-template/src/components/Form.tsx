import React, { useEffect, useState } from 'react';
import {
  Categories,
  CategoryItem,
  FormActions,
  FormContent,
  FormEditor,
  FormFooter,
  FormHeader,
  FormTitle,
  TemplateDescription,
  TemplateTitle
} from '../styles';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { Form as CommonForm } from '@erxes/ui/src/components/form';
import Select from 'react-select';
import { RichTextEditor } from '@erxes/ui/src/components/richTextEditor/TEditor';
import Preview from '../containers/Preview';
import xss from 'xss';
import { ITemplate } from '../types';

type Props = {
  mode: string;
  template?: ITemplate;
  categoryOptions: any[];
  closeDrawer(): void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const Form = (props: Props) => {
  const { mode, template, categoryOptions, closeDrawer, renderButton } = props;

  const [description, setDescription] = useState<string>(
    template?.description || ''
  );
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    if (template) {
      setCategoryIds(template.categories?.map((category) => category._id));
    }
  }, []);

  const generateDocs = (values) => {
    const finalValues = values;

    if (template) {
      finalValues._id = template._id;
    }

    return {
      _id: finalValues._id,
      ...finalValues,
      description,
      categoryIds
    };
  };

  const handleSelect = (options) => {
    const values = (options || []).map((option) => option.value);
    setCategoryIds(values);
  };

  const handleDescriptionChange = (content: string) => {
    setDescription(content);
  };

  const renderView = (formProps: IFormProps) => {
    if (mode === 'edit') {
      return (
        <>
          <FormGroup>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl
              {...formProps}
              name="name"
              defaultValue={template?.name || ''}
              required={true}
              autoFocus={true}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel required={true}>Description</ControlLabel>
            <FormEditor>
              <RichTextEditor
                content={description}
                onChange={handleDescriptionChange}
                height={160}
                toolbar={['bold', 'italic', 'orderedList', 'bulletList']}
              />
            </FormEditor>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Categories</ControlLabel>
            <Select
              isClearable={true}
              isMulti={true}
              value={categoryOptions.filter((option) =>
                categoryIds.includes(option.value)
              )}
              options={categoryOptions}
              onChange={handleSelect}
            />
          </FormGroup>
        </>
      );
    }

    return (
      <>
        <Preview template={template} />
        <TemplateTitle>{template?.name}</TemplateTitle>
        <TemplateDescription
          dangerouslySetInnerHTML={{ __html: xss(template?.description || '') }}
        />
        <FormGroup>
          {!!template?.categories?.length && (
            <>
              <ControlLabel>Categories</ControlLabel>
              <Categories justifyContent="start">
                {(template?.categories || []).map((category) => (
                  <CategoryItem key={category._id}>
                    {category.name}
                  </CategoryItem>
                ))}
              </Categories>
            </>
          )}
        </FormGroup>
      </>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    return (
      <>
        <FormContent>
          <FormHeader>
            <FormTitle>Template</FormTitle>
            <FormActions>
              {/* <Icon icon='external-link-alt' />
                            <Icon icon='import' />
                            <Icon icon='ellipsis-h' /> */}
              <Icon icon="times" onClick={closeDrawer} />
            </FormActions>
          </FormHeader>
          {renderView(formProps)}
        </FormContent>
        {mode === 'edit' && (
          <FormFooter>
            {renderButton({
              text: 'Template',
              values: generateDocs(values),
              isSubmitted,
              object: template
            })}
          </FormFooter>
        )}
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
