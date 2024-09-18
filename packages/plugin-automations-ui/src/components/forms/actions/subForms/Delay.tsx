import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { IAction } from '@erxes/ui-automations/src/types';
import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import { BoardHeader, DrawerDetail } from '@erxes/ui-automations/src/styles';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { __ } from '@erxes/ui/src/utils/core';
import FormControl from '@erxes/ui/src/components/form/Control';

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  triggerType: string;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
};

const options = [
  {
    label: 'Minute',
    value: 'minute'
  },
  {
    label: 'Hour',
    value: 'hour'
  },
  {
    label: 'Day',
    value: 'day'
  }
];

export default function Delay(props: Props) {
  const { activeAction } = props;
  const [config, setConfig] = useState(activeAction?.config || {});

  useEffect(() => {
    setConfig(activeAction.config);
  }, [activeAction]);

  const onChange = (name: string, value: any) =>
    setConfig({ ...config, [name]: value });

  const onChangeValue = (e) => onChange('value', e.target.value);
  const onChangeSelect = (option) => onChange('type', option?.value);

  const renderContent = () => {
    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel required={true}>{__('Type')}</ControlLabel>

          <Select
            value={options.find((o) => o.value === (config?.type || 'hour'))}
            options={options}
            onChange={onChangeSelect}
            isClearable={false}
          />
        </FormGroup>

        <BoardHeader>
          <FormGroup>
            <div className="header-row">
              <ControlLabel required={true}>{__('Value')}</ControlLabel>
            </div>
            <FormControl
              type="number"
              onChange={onChangeValue}
              defaultValue={0}
              value={config?.value}
            />
          </FormGroup>
        </BoardHeader>
      </DrawerDetail>
    );
  };

  return (
    <Common config={config} {...props}>
      {renderContent()}
    </Common>
  );
}
