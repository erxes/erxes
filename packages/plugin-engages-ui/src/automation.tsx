import React, { useEffect, useState } from 'react';
import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import { ControlLabel, FormGroup } from '@erxes/ui/src/components/form';
import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import SelectBrodcast from '@erxes/ui-engage/src/components/SelectBrodcasts';
import { LinkButton } from '@erxes/ui/src/styles/main';
import { FlexRow } from '@erxes/ui-settings/src/styles';

function ActionForm(props) {
  const { activeAction } = props;

  const [config, setConfig] = useState<any>(activeAction?.config || {});

  useEffect(() => {
    setConfig({ ...config, ...activeAction?.config });
  }, [activeAction?.config]);

  const onSelect = (value, name) => {
    setConfig({ ...config, [name]: value });
  };

  return (
    <Common config={config} {...props}>
      <DrawerDetail>
        <PlaceHolderInput
          inputName="broadcastName"
          label="Name"
          config={config}
          onChange={setConfig}
          triggerType={props.triggerType}
        />
        <FormGroup>
          <FlexRow $alignItems="center" $justifyContent="space-between">
            <ControlLabel optional>{`Select Broadcast`}</ControlLabel>
            <LinkButton
              target="__blank"
              href="/campaigns/create"
            >{`+ Create New Broadcast`}</LinkButton>
          </FlexRow>
          <SelectBrodcast
            name="broadcastId"
            label="Broadcast"
            initialValue={config?.broadcastId}
            onSelect={onSelect}
          />
        </FormGroup>
      </DrawerDetail>
    </Common>
  );
}

export default function Automations(props) {
  const { componentType } = props;

  switch (componentType) {
    case 'actionForm':
      return <ActionForm {...props} />;
    default:
      return null;
  }
}
