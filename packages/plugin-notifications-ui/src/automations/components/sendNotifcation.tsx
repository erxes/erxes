import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import { IAction } from '@erxes/ui-automations/src/types';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ModalTrigger,
  SelectTeamMembers,
  TabTitle,
  Tabs,
  Toggle,
  __,
  colors,
} from '@erxes/ui/src';
import { Columns } from '@erxes/ui/src/styles/chooser';
import { Column } from '@erxes/ui/src/styles/main';
import React, { useState, useEffect } from 'react';
import { Padding, TopContainer } from '../styles';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';

type Props = {
  activeAction: IAction;
  triggerType: string;
  closeModal: () => void;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
};

const sendNotifcation = (props: Props) => {
  const { activeAction, triggerType, closeModal, addAction } = props;

  const [config, setConfig] = useState<any>();
  const [currentTab, setCurrentTab] = useState<string>('');
  const [useCustomConfig, setUseCustomConfig] = useState<boolean>();

  useEffect(() => {
    const config = activeAction?.config;
    const isStatic =
      !!config?.teamMemberIds?.length || !!config?.customerIds?.length;
    const customConfig = !!config?.customConfig || false;

    setConfig(config || {});
    setCurrentTab(isStatic ? 'static' : 'general');
    setUseCustomConfig(customConfig);
  }, [config]);

  const handleTab = (value) => () => {
    const { sendTo, teamMemberIds, customerIds, ...obj } = config;

    setConfig({ ...obj });
    setCurrentTab(value);
  };

  const isActiveTab = (value) => {
    return currentTab === value ? 'active' : '';
  };

  const handleOnChange = (config) => {
    setConfig(config);
  };

  const handleOnSelect = (value, name) => {
    handleOnChange({ ...config, [name]: value });
  };

  const handleSettingOnChange = (e) => {
    const { value } = e.currentTarget as HTMLInputElement;

    setConfig((prevConfig) => {
      return { ...prevConfig, customConfig: value };
    });
  };

  const renderSettings = () => {
    const trigger = (
      <Button
        icon="settings"
        iconColor={config?.customConfig ? colors.colorCoreBlue : ''}
        btnStyle="link"
      />
    );

    const content = () => {
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
              </ControlLabel>
              <p>{__('Firebase config for notifications')}</p>
              <FormControl
                placeholder="paste a config"
                onChange={handleSettingOnChange}
                value={config?.customConfig}
              />
            </FormGroup>
          )}
        </>
      );
    };

    return (
      <ModalTrigger trigger={trigger} content={content} hideHeader title="" />
    );
  };

  const renderStatic = () => {
    return (
      <Padding>
        <FormGroup>
          <ControlLabel>{__('Team Members')}</ControlLabel>
          <SelectTeamMembers
            name="teamMemberIds"
            label="select team members"
            multi
            onSelect={handleOnSelect}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Customers')}</ControlLabel>
          <SelectCustomers
            name="customerIds"
            label="select customers"
            multi
            onSelect={handleOnSelect}
          />
        </FormGroup>
      </Padding>
    );
  };

  const renderGeneral = () => {
    const isAviableTriggerExcutor = ['contacts', 'user'].some((c) =>
      triggerType.includes(c),
    );

    const customAttributions = isAviableTriggerExcutor
      ? [
          {
            _id: String(Math.random()),
            label: 'Trigger Executor',
            name: 'triggerExecutor',
            type: 'segment',
          },
        ]
      : [];

    return (
      <PlaceHolderInput
        triggerType={triggerType}
        config={config}
        inputName="sendTo"
        attrTypes={['user', 'contact', 'segment']}
        label="Send To"
        onChange={handleOnChange}
        customAttributions={customAttributions}
        required
      />
    );
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'general':
        return renderGeneral();
      case 'static':
        return renderStatic();
      default:
        return null;
    }
  };

  const renderMainContent = () => {
    return (
      <>
        <PlaceHolderInput
          inputName="subject"
          label="Subject"
          config={config}
          onChange={handleOnChange}
          triggerType={triggerType}
          required
        />
        <PlaceHolderInput
          inputName="body"
          label="Body"
          config={config}
          onChange={handleOnChange}
          triggerType={triggerType}
          required
        />
      </>
    );
  };

  return (
    <DrawerDetail>
      <Common
        closeModal={closeModal}
        addAction={addAction}
        activeAction={activeAction}
        config={config}
      >
        <TopContainer>{renderSettings()}</TopContainer>
        <Tabs full>
          <TabTitle
            className={isActiveTab('general')}
            onClick={handleTab('general')}
          >
            {__('General')}
          </TabTitle>
          <TabTitle
            className={isActiveTab('static')}
            onClick={handleTab('static')}
          >
            {__('Static')}
          </TabTitle>
        </Tabs>
        <Padding>{renderTabContent()}</Padding>
        <Padding>{renderMainContent()}</Padding>
      </Common>
    </DrawerDetail>
  );
};

export default sendNotifcation;
