import { ITrigger } from '@erxes/ui-segments/src/types';
import React, { useState } from 'react';
import BotSelector, { BorderedCollapseContent } from './BotSelector';
import Select from 'react-select-plus';
import { Flex } from '@erxes/ui/src/styles/main';
import {
  Button,
  ControlLabel,
  FormGroup,
  ModalTrigger,
  Toggle,
  __,
} from '@erxes/ui/src';
import DirectMessageForm from './DirectMessage';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import { Features, Padding } from '../../styles';
import PostSelector from './PostSelector';

type Props = {
  activeTrigger: ITrigger;
  addConfig: (trigger: ITrigger, id?: string, config?: any) => void;
  closeModal: () => void;
  triggerConst: any;
};

const POST_TYPE = [
  {
    label: 'Specific post',
    value: 'specific',
  },
  {
    label: 'Any post',
    value: 'any',
  },
];

const postSelector = (botId, onChange) => {
  const trigger = <Button block>{__('Select Post')}</Button>;

  const content = ({ closeModal }) => {
    const onSelect = (postId) => {
      onChange('postId', postId);
      closeModal();
    };

    return <PostSelector botId={botId} onSelect={onSelect} />;
  };

  return (
    <ModalTrigger trigger={trigger} content={content} hideHeader title="" />
  );
};

function CommnetForm({
  activeTrigger,
  addConfig,
  closeModal,
  triggerConst,
}: Props) {
  const [config, setConfig] = useState(
    activeTrigger.config || { postType: 'specific' },
  );

  const onSave = (conditions) => {
    // const updatedConfig = { ...config, conditions };

    setConfig(config);
    addConfig(activeTrigger, activeTrigger.id, config);
    closeModal();
  };

  const handleChange = (name, value) => {
    setConfig({ ...config, [name]: value });
  };

  return (
    <DrawerDetail>
      <BotSelector
        botId={config.botId}
        onSelect={(botId) => handleChange('botId', botId)}
      />
      <Features isToggled={config.botId}>
        <Select
          options={POST_TYPE}
          value={config?.postType}
          onChange={({ value }) => handleChange('postType', value)}
        />

        {postSelector(config.botId, handleChange)}

        <Padding>
          <Flex style={{ justifyContent: 'space-between' }}>
            <ControlLabel>
              {__(
                `comment contains ${
                  config?.checkContent ? 'specific' : 'any'
                } words`,
              )}
            </ControlLabel>
            <Toggle
              checked={config?.checkContent}
              onChange={() =>
                handleChange('checkContent', !config?.checkContent)
              }
            />
          </Flex>
        </Padding>
        {config?.checkContent && (
          <DirectMessageForm
            conditions={config.conditions}
            onChange={handleChange}
            label="Comment"
          />
        )}
      </Features>
      {/* </BorderedCollapseContent> */}
    </DrawerDetail>
  );
}

export default CommnetForm;
