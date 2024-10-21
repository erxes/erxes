import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils/core';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import SelectKbCategories from '@erxes/ui-knowledgebase/src/components/SelectKbCategories';
import SelectKbTopics from '@erxes/ui-knowledgebase/src/components/SelectKbTopics';
import { ControlLabel, FormGroup } from '@erxes/ui/src/components/form';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';

function ActionForm({ closeModal, addConfig, activeTrigger }) {
  const [config, setConfig] = useState(activeTrigger?.config || {});

  const onSelect = (value, name) => {
    setConfig({ ...config, [name]: value });
  };
  const onSave = () => {
    addConfig(activeTrigger, activeTrigger.id, {
      ...(activeTrigger?.config || {}),
      ...config
    });
    closeModal();
  };

  return (
    <DrawerDetail>
      <FormGroup>
        <ControlLabel optional>{`Select Knowledgebase Topic`}</ControlLabel>
        <SelectKbTopics name="topicId" label="Topic" onSelect={onSelect} />
      </FormGroup>
      <FormGroup>
        <ControlLabel
          optional
        >{`Select Knowledgebase Categories`}</ControlLabel>
        <SelectKbCategories
          name="categoryIds"
          label={__("Category")}
          onSelect={onSelect}
          multi
          filterParams={{ topicIds: config?.topicId ? [config.topicId] : [] }}
        />
      </FormGroup>
      <ModalFooter>
        <Button btnStyle="simple" onClick={closeModal}>
          {__('Cancel')}
        </Button>
        <Button btnStyle="success" onClick={onSave}>
          {__('Save')}
        </Button>
      </ModalFooter>
    </DrawerDetail>
  );
}

export default function Automations(props) {
  const { componentType } = props;

  switch (componentType) {
    case 'triggerForm':
      return <ActionForm {...props} />;
    default:
      return null;
  }
}
