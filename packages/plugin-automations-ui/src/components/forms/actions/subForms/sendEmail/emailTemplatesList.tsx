import {
  BarItems,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ModalTrigger,
  __
} from '@erxes/ui/src';

import EmailTemplateForm from '@erxes/ui-emailtemplates/src/containers/Form';
import SelectEmailTemplates from '@erxes/ui-emailtemplates/src/containers/SelectEmailtTemplate';
import React, { useState } from 'react';
import { SelectDocument } from './selectDocument';
import { getContentType } from './utils';

export const EmailTemplatesList = ({ triggerType, onChangeConfig }) => {
  const [searchValue, setSearchValue] = useState('');
  const addTemplateForm = () => {
    const trigger = (
      <Button btnStyle='success' icon='plus-circle'>
        {__('Add template')}
      </Button>
    );

    const content = ({ closeModal }) => {
      const updatedProps = {
        closeModal,
        contentType: getContentType(triggerType),
        additionalToolbarContent: SelectDocument({ triggerType }),
        params: { searchValue }
      };

      return <EmailTemplateForm {...updatedProps} />;
    };

    return (
      <ModalTrigger
        title='Add new email template'
        content={content}
        trigger={trigger}
        size='lg'
      />
    );
  };

  const onSearch = (e) => {
    const { value } = e.currentTarget as HTMLInputElement;

    setSearchValue(value);
  };

  const selectTemplate = (id: string) => {
    onChangeConfig('templateId', id);
  };

  return (
    <>
      <FormGroup>
        <ControlLabel>{__('Search')}</ControlLabel>
        <BarItems>
          <FormControl
            name='searchValue'
            placeholder={__('Type to search')}
            value={searchValue}
            onChange={onSearch}
          />
          {addTemplateForm()}
        </BarItems>
      </FormGroup>
      <SelectEmailTemplates
        searchValue={searchValue}
        handleSelect={selectTemplate}
      />
    </>
  );
};
