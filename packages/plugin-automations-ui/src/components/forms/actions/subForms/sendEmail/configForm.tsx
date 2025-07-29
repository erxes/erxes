import {
  Button,
  ControlLabel,
  FormGroup,
  Icon,
  ModalTrigger,
  SelectTeamMembers,
  __,
  colors
} from '@erxes/ui/src';

import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import { ItemRow } from '@erxes/ui-automations/src/components/forms/actions/ItemRow';
import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import { DrawerDetail, ItemRowHeader } from '@erxes/ui-automations/src/styles';
import EmailTemplate from '@erxes/ui-emailtemplates/src/containers/EmailTemplate';
import { IEmailTemplate } from '@erxes/ui-emailtemplates/src/types';
import { FlexRow } from '@erxes/ui-settings/src/styles';
import React from 'react';
import { RecipientsForm } from './recipientForm';
import { EmailTemplatesList } from './emailTemplatesList';
import { checkToFieldConfigured } from './utils';
import { EditEmailTemplateForm } from './editEmailTemplateForm';
import { IAction } from '@erxes/ui-automations/src/types';
import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';

type Props = {
  emailRecipientsConst: { type: string; name: string; label: string }[];
  config: any;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  activeAction: IAction;
  closeModal: () => void;
  triggerConfig;
  setConfig: (config: any) => void;
  triggerType: string;
  additionalAttributes: FieldsCombinedByType[];
};

export const ConfigForm = ({
  emailRecipientsConst,
  config,
  addAction,
  activeAction,
  closeModal,
  triggerConfig,
  setConfig,
  triggerType,
  additionalAttributes
}: Props) => {
  const onSelect = (value, name) => {
    setConfig({ ...config, [name]: value });
  };

  return (
    <Common
      closeModal={closeModal}
      addAction={addAction}
      activeAction={activeAction}
      config={config}
    >
      <DrawerDetail>
        <ItemRow
          title={__('Sender')}
          description={__('Who is sending email')}
          buttonText='sender'
          isDone={config?.fromUserId}
          config={config}
          content={(doc, onChange) => (
            <FormGroup>
              <ControlLabel>{'Sender'}</ControlLabel>
              <SelectTeamMembers
                name='fromUserId'
                initialValue={doc?.fromUserId || config?.fromUserId}
                label={__('Select sender user')}
                onSelect={(value, name) => onChange({ ...doc, [name]: value })}
                filterParams={{
                  status: 'Verified'
                }}
                multi={false}
              />
            </FormGroup>
          )}
          onSave={({ fromUserId }) => onSelect(fromUserId, 'fromUserId')}
          subContent={config?.fromUserId ? '' : 'Select Sender'}
        />
        <ItemRow
          title={__('Reciepent')}
          description=''
          buttonText='select recipients'
          config={config}
          isDone={checkToFieldConfigured(emailRecipientsConst, config)}
          content={(doc, onChange) => (
            <RecipientsForm
              config={doc}
              onChangeConfig={onChange}
              emailRecipientsConst={emailRecipientsConst}
              triggerConfig={triggerConfig}
              triggerType={triggerType}
              additionalAttributes={additionalAttributes}
            />
          )}
          onSave={setConfig}
          subContent={config?.to ? '' : 'Select recipients'}
        />
        <ItemRow
          title={__('Subject')}
          description={__('Configure the subject of the email')}
          buttonText='subject'
          config={config}
          isDone={config?.subject}
          content={(doc, onChange) => (
            <PlaceHolderInput
              inputName='subject'
              label={__('Email Subject')}
              config={doc}
              onChange={() => null}
              onKeyPress={(e: any) => {
                const { name, value } = e.currentTarget as HTMLInputElement;
                onChange({ [name]: value });
              }}
              triggerType={triggerType}
            />
          )}
          subContent={__(config?.subject ? '' : 'Enter subject')}
          onSave={(doc) => setConfig({ ...config, ...doc })}
        />

        <FlexRow $justifyContent='space-between'>
          <FlexRow $alignItems='baseline'>
            <ItemRowHeader>{__('Selected Email Template')}</ItemRowHeader>
            <Icon
              color={colors.colorCoreGreen}
              icon='check-circle'
              style={{ paddingLeft: '6px' }}
            />
          </FlexRow>
          <ModalTrigger
            title={__('Email Templates')}
            size='xl'
            trigger={
              <Button btnStyle='white'>{__(`Change email template`)}</Button>
            }
            content={() => (
              <EmailTemplatesList
                triggerType={triggerType}
                onChangeConfig={(name, value) => {
                  setConfig({ ...config, [name]: value });
                }}
              />
            )}
          />
        </FlexRow>
        <EmailTemplate
          templateId={config?.templateId}
          onlyPreview
          additionalAction={(template: IEmailTemplate, refetch: () => void) => (
            <EditEmailTemplateForm
              triggerType={triggerType}
              template={template}
              refetch={refetch}
            />
          )}
        />
      </DrawerDetail>
    </Common>
  );
};
