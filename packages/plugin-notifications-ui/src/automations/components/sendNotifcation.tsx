import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import { ItemRow } from '@erxes/ui-automations/src/components/forms/actions/ItemRow';
import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import { IAction } from '@erxes/ui-automations/src/types';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import {
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Label,
  SelectTeamMembers,
  TabTitle,
  Tabs,
  Toggle,
  __
} from '@erxes/ui/src';
import { Columns } from '@erxes/ui/src/styles/chooser';
import { Column, LinkButton } from '@erxes/ui/src/styles/main';
import React, { useCallback, useEffect, useState } from 'react';
import { Padding } from '../styles';

type Props = {
  activeAction: IAction;
  triggerType: string;
  closeModal: () => void;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
};

const sendNotifcation = (props: Props) => {
  const { activeAction, triggerType, closeModal, addAction } = props;

  const [config, setConfig] = useState<any>({});
  const [currentTab, setCurrentTab] = useState<'general' | 'static'>('general');

  const [useCustomConfig, setUseCustomConfig] = useState(false);

  useEffect(() => {
    const config = activeAction?.config;

    setConfig(config || {});
    setUseCustomConfig(!!config?.customConfig);
  }, [activeAction?.config]);

  const handleOnChange = config => {
    setConfig(config);
  };

  const renderCustomConfig = (doc: any, onChange: (...props: any) => void) => {
    const handleSettingOnChange = e => {
      const { value } = e.currentTarget as HTMLInputElement;

      onChange({ ...doc, customConfig: value });
    };
    return (
      <>
        <Columns>
          <Column>
            <ControlLabel>
              {__('Use Custom Firebase notification config')}
            </ControlLabel>
          </Column>
          <Toggle
            checked={useCustomConfig}
            onChange={() => setUseCustomConfig(!useCustomConfig)}
          />
        </Columns>
        {useCustomConfig && (
          <FormGroup>
            <ControlLabel>
              {__('GOOGLE APPLICATION CREDENTIALS JSON')}
              <LinkButton>{__('Add additional JSON')}</LinkButton>
            </ControlLabel>
            <p>{__('Firebase config for notifications')}</p>
            <FormControl
              placeholder={__("Paste a config")}
              onChange={handleSettingOnChange}
              value={config?.customConfig}
            />
          </FormGroup>
        )}
      </>
    );
  };

  const renderStatic = (doc: any, onChange: (...props: any) => void) => {
    return (
      <Padding>
        <FormGroup>
          <ControlLabel>{__('Team Members')}</ControlLabel>
          <SelectTeamMembers
            name="teamMemberIds"
            initialValue={config?.teamMemberIds}
            label={__("select team members")}
            multi
            onSelect={(value, name) => onChange({ ...doc, [name]: value })}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Customers')}</ControlLabel>
          <SelectCustomers
            name="customerIds"
            label={__("select customers")}
            initialValue={config?.customerIds}
            multi
            onSelect={(value, name) => onChange({ ...doc, [name]: value })}
          />
        </FormGroup>
      </Padding>
    );
  };

  const renderGeneral = (_doc, onChange) => {
    const isAviableTriggerExcutor = ['contacts', 'user'].some(c =>
      triggerType.includes(c)
    );

    const customAttributions = isAviableTriggerExcutor
      ? [
          {
            _id: String(Math.random()),
            label: __('Trigger Executor'),
            name: 'triggerExecutor',
            type: 'segment'
          }
        ]
      : [];

    return (
      <PlaceHolderInput
        triggerType={triggerType}
        config={config}
        inputName="sendTo"
        attrTypes={['user', 'contact', 'segment']}
        label={__("Send To")}
        onChange={onChange}
        customAttributions={customAttributions}
        required
      />
    );
  };

  const renderTabContent = (doc: any, onChange: (...props: any) => void) => {
    const content = {
      general: renderGeneral(doc, onChange),
      static: renderStatic(doc, onChange)
    };

    const toggleTab = () =>
      setCurrentTab(currentTab === 'general' ? 'static' : 'general');
    const isActiveTab = value => {
      return currentTab === value ? 'active' : '';
    };

    return (
      <Padding>
        <Tabs full>
          <TabTitle className={isActiveTab('general')} onClick={toggleTab}>
            {__('General')}

            {config?.sendTo && (
              <Label lblStyle="success" ignoreTrans shake>
                <Icon icon="check" />
              </Label>
            )}
          </TabTitle>
          <TabTitle className={isActiveTab('static')} onClick={toggleTab}>
            {__('Static')}
            {['teamMemberIds', 'customerIds'].some(
              key => config[key]?.length
            ) && (
              <Label lblStyle="success" ignoreTrans shake>
                <Icon icon="check" />
              </Label>
            )}
          </TabTitle>
        </Tabs>
        <Padding>{content[currentTab]}</Padding>
      </Padding>
    );
  };

  const renderMainContent = (doc: any, onChange: (...props: any) => void) => {
    return (
      <Padding>
        <PlaceHolderInput
          inputName="subject"
          label={__("Subject)")}
          config={doc}
          onChange={onChange}
          triggerType={triggerType}
          required
        />
        <PlaceHolderInput
          inputName="body"
          label={__("Body")}
          config={doc}
          onChange={onChange}
          triggerType={triggerType}
          required
        />
      </Padding>
    );
  };

  const checkIsDone = useCallback(
    (field: string) => {
      if (field === 'recipient') {
        return ['sendTo', 'teamMemberIds', 'customerIds'].some(key =>
          Array.isArray(config[key])
            ? (config[key] || [])?.length
            : config[key] && Object.keys(config).includes(key)
        );
      }
      if (field === 'content') {
        return ['subject', 'body'].every(key => !!config[key]);
      }
    },
    [JSON.stringify(config)]
  );

  return (
    <DrawerDetail>
      <Common
        closeModal={closeModal}
        addAction={addAction}
        activeAction={activeAction}
        config={config}
      >
        <ItemRow
          title={__("Recipients")}
          description={__("Who is recieve notification")}
          buttonText="recipient"
          config={config}
          isDone={checkIsDone('recipient')}
          content={renderTabContent}
          onSave={handleOnChange}
          subContent={''}
        />

        <ItemRow
          title={__("Content")}
          description={__("Notification content")}
          buttonText="content"
          config={config}
          isDone={checkIsDone('content')}
          content={renderMainContent}
          onSave={handleOnChange}
          subContent={''}
        />
        <ItemRow
          title={__("Custom notification config (Optional)")}
          description={__("Custom google application credentials json")}
          buttonText="custom config"
          config={config}
          isDone={config?.customConfig}
          content={renderCustomConfig}
          onSave={handleOnChange}
          subContent={''}
        />
      </Common>
    </DrawerDetail>
  );
};

export default sendNotifcation;
