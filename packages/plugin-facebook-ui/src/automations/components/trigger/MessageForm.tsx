import { ITrigger } from '@erxes/ui-segments/src/types';
import React, { useState } from 'react';
import BotSelector from './BotSelector';
import EditForm from './MessageEditForm';

type Props = {
  activeTrigger: ITrigger;
  addConfig: (trigger: ITrigger, id?: string, config?: any) => void;
  closeModal: () => void;
  triggerConst: any;
};

function MessageForm({
  activeTrigger,
  addConfig,
  closeModal,
  triggerConst,
}: Props) {
  const [config, setConfig] = useState(activeTrigger.config || {});

  const onSave = (conditions) => {
    const updatedConfig = { ...config, conditions };

    setConfig(updatedConfig);
    addConfig(activeTrigger, activeTrigger.id, updatedConfig);
    closeModal();
  };

  return (
    <>
      <BotSelector
        botId={config.botId}
        onSelect={(botId) => setConfig({ ...config, botId })}
      />
      <EditForm
        config={config}
        triggerConst={triggerConst}
        onSave={onSave}
        onCancel={closeModal}
      />
    </>
  );
}

export default MessageForm;
