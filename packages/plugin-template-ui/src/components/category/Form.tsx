import React, { useState } from 'react';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import {
  FormActions,
  FormContent,
  FormFooter,
  FormHeader,
  FormTitle
} from '../../../../ui-template/src/styles';
import Icon from '@erxes/ui/src/components/Icon';
import Select from 'react-select';
import { Form as CommonForm } from '@erxes/ui/src/components/form';
import { ITemplateCategory } from '@erxes/ui-template/src/types';

type Props = {
  type: string;
  category: ITemplateCategory;
  categoryOptions: any[];
  closeDrawer(): void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const Form = (props: Props) => {
  const { type, category, categoryOptions, renderButton, closeDrawer } = props;

  const [parentId, setParentId] = useState<string>(category?.parentId || '');

  const handleSelect = (option) => {
    setParentId(option?.value || '');
  };

  const generateDocs = (values) => {
    const finalValues = values;

    if (category) {
      finalValues._id = category._id;
    }

    return {
      _id: finalValues._id,
      ...finalValues,
      parentId,
      contentType: type
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    return (
      <>
        <FormContent>
          <FormHeader>
            <FormTitle>Template category</FormTitle>
            <FormActions>
              <Icon icon="times" onClick={closeDrawer} />
            </FormActions>
          </FormHeader>
          <FormGroup>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl
              {...formProps}
              name="name"
              defaultValue={category?.name || ''}
              required={true}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel required={true}>Code</ControlLabel>
            <FormControl
              {...formProps}
              name="code"
              defaultValue={category?.code || ''}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Parent Category</ControlLabel>
            <Select
              isClearable
              defaultValue={categoryOptions.find(
                (option) => option.value === parentId
              )}
              options={categoryOptions}
              onChange={handleSelect}
            />
          </FormGroup>
        </FormContent>
        <FormFooter>
          {renderButton({
            text: 'Template Category',
            values: generateDocs(values),
            isSubmitted,
            object: category
          })}
        </FormFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
