import ModifiableList from '@erxes/ui/src/components/ModifiableList';
import Uploader from '@erxes/ui/src/components/Uploader';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Container } from '../styles';
import { Config, PageTemplate } from '../types';
import LinkAction from './LinkAction';

type Props = {
  _id: string;
  template: PageTemplate;
  config: Config;
  messageTemplates: PageTemplate[];
  onChangeConfig: (config: Config) => void;
};

function TemplateContent({
  _id,
  template,
  config,
  messageTemplates,
  onChangeConfig
}: Props) {
  const { image, title, description, buttons = [] } = template;

  const onChange = (name, value) => {
    const updatedTemplates = messageTemplates.map(temp =>
      temp._id === _id ? { ...temp, [name]: value } : temp
    );

    onChangeConfig({ ...config, messageTemplates: updatedTemplates });
  };

  const handleChange = e => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    onChange(name, value);
  };

  const handleUpload = value => {
    if (value.length > 0) {
      const image = value[0];
      return onChange('image', image);
    }
    onChange('image', null);
  };

  const onChangeButtons = list => {
    const uniqueButtons = list.filter(
      item => !buttons.some(btn => btn.text === item)
    );

    const convertedButtons = uniqueButtons.map(button => ({
      text: button,
      _id: Math.random().toString()
    }));

    onChange('buttons', [...buttons, ...convertedButtons]);
  };

  const onChangeLink = ({ e, text }) => {
    const { value } = e.currentTarget as HTMLInputElement;

    onChange(
      'buttons',
      buttons.map(btn => (btn.text === text ? { ...btn, link: value } : btn))
    );
  };

  return (
    <Container>
      {messageTemplates?.length > 1 && (
        <Uploader
          single
          text="Upload Image"
          onChange={handleUpload}
          defaultFileList={image ? [image] : []}
        />
      )}
      <FormGroup>
        <ControlLabel>{__('Title')}</ControlLabel>
        <FormControl name="title" onChange={handleChange} value={title || ''} />
      </FormGroup>
      {messageTemplates?.length > 1 && (
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            name="description"
            componentClass="textarea"
            value={description || ''}
            onChange={handleChange}
          />
        </FormGroup>
      )}
      <ModifiableList
        options={buttons.map(btn => btn.text) || []}
        addButtonLabel="Add Buttons"
        showAddButton
        onChangeOption={onChangeButtons}
        extraActions={text => (
          <LinkAction
            container={this}
            onChange={e => onChangeLink({ e, text })}
            link={buttons.find(btn => btn.text === text)?.link}
          />
        )}
      />
    </Container>
  );
}

export default TemplateContent;
