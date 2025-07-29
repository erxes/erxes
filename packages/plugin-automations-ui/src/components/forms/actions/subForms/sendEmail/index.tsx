import { IAction } from '@erxes/ui-automations/src/types';
import React, { useState } from 'react';
import { ConfigForm } from './configForm';
import { EmailTemplatesList } from './emailTemplatesList';

type Props = {
  activeAction: any;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  closeModal: () => void;
  triggerType: string;
  triggerConfig: any;
  actionsConst: any[];
  triggersConst: any[];
};

export default function SendEmail({
  triggerType,
  actionsConst,
  addAction,
  activeAction,
  closeModal,
  triggerConfig,
  triggersConst
}: Props) {
  const [config, setConfig] = useState<any>(activeAction?.config || {});

  if (config?.templateId) {
    const { emailRecipientsConst = [] } =
      actionsConst.find((action) => action.type === 'sendEmail') || {};
    const { additionalAttributes = [] } =
      (triggersConst || []).find(({ type }) => type === triggerType) || {};

    const updatedProps = {
      emailRecipientsConst,
      config,
      addAction,
      activeAction,
      closeModal,
      triggerConfig,
      setConfig,
      triggerType,
      additionalAttributes
    };

    return <ConfigForm {...updatedProps} />;
  }

  return (
    <EmailTemplatesList
      triggerType={triggerType}
      onChangeConfig={(name, value) => {
        setConfig({ ...config, [name]: value });
      }}
    />
  );
}
