import { __ } from '@erxes/ui/src/utils/core';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import React, { useState } from 'react';
import { TabAction } from './ReplyFbMessage';
import TemplateContent from './TemplateContent';
import { Config } from '../types';
const generateSelectedPageId = ({ messageTemplates = [] }: Config) => {
  return messageTemplates[0]?._id || '';
};

type Props = {
  config: Config;
  onChangeConfig: (config: Config) => void;
};

function Template({ config, onChangeConfig }: Props) {
  const [selectedTemplatePageId, setSelectedTemplatePageId] = useState(
    generateSelectedPageId(config)
  );

  const { messageTemplates = [] } = config;

  const selectedTemplatePage = messageTemplates.find(
    temp => temp._id === selectedTemplatePageId
  );

  const addPage = () => {
    const updatedConfig = {
      ...config,
      messageTemplates: [
        ...messageTemplates,
        {
          _id: Math.random().toString(),
          label: `Page ${(messageTemplates?.length || 0) + 1}`
        }
      ]
    };

    onChangeConfig(updatedConfig);
  };

  const onSelectTab = value => {
    setSelectedTemplatePageId(value);
  };

  const handleRemovePage = _id => {
    const filteredTemplatePages = messageTemplates.filter(
      messageTemplate => messageTemplate._id !== _id
    );

    onChangeConfig({
      ...config,
      messageTemplates: filteredTemplatePages
    });
  };

  return (
    <>
      <Tabs>
        {messageTemplates.map(({ _id, label }) => (
          <TabTitle
            key={_id}
            className={_id === selectedTemplatePageId ? 'active' : ''}
            onClick={onSelectTab.bind(this, _id)}
          >
            {__(label)}
            <TabAction onClick={handleRemovePage.bind(this, _id)}>
              <Icon icon="times-circle" />
            </TabAction>
          </TabTitle>
        ))}

        <Button btnStyle="link" icon="focus-add" onClick={addPage} />
      </Tabs>
      {selectedTemplatePage && (
        <TemplateContent
          _id={selectedTemplatePageId}
          template={selectedTemplatePage}
          config={config}
          messageTemplates={messageTemplates}
          onChangeConfig={onChangeConfig}
        />
      )}
    </>
  );
}

export default Template;
