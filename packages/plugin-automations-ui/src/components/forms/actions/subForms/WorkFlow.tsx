import React, { useState } from 'react';
import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import { IAction } from '@erxes/ui-automations/src/types';
import { setConfig } from '@erxes/ui';
import { IAutomation } from '../../../../types';

type Props = {
  list: IAutomation[];
  actionsConst: any[];
  activeAction: IAction;
  addAction: () => void;
  closeModal: () => void;
  onSave: () => void;
  propertyTypesConst: any[];
};
export default function Workflow({
  list,
  closeModal,
  activeAction,
  addAction
}: Props) {
  const [config, setConfig] = useState(activeAction?.config || {});

  return (
    <Common
      closeModal={closeModal}
      addAction={addAction}
      activeAction={activeAction}
      config={config}
    >
      {list.map(({ _id, name }) => (
        <li onClick={() => setConfig({ ...config, workflowId: _id })}>
          {_id === config.workflowId ? 'selected' : ''}
          {name}
        </li>
      ))}
    </Common>
  );
}
