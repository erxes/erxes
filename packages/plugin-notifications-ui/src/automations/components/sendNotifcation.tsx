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
  colors
} from '@erxes/ui/src';
import { Columns } from '@erxes/ui/src/styles/chooser';
import { Column } from '@erxes/ui/src/styles/main';
import React from 'react';
import { Padding, TopContainer } from '../styles';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';

type Props = {
  activeAction: IAction;
  triggerType: string;
  closeModal: () => void;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
};

type State = {
  config: any;
  currentTab: string;
  useCustomConfig: boolean;
};

class SendNotification extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const config = props?.activeAction?.config;
    const isStatic =
      !!config?.teamMemberIds?.length || !!config?.customerIds?.length;

    this.state = {
      config: config || {},
      currentTab: isStatic ? 'static' : 'general',
      useCustomConfig: !!config?.customConfig || false
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(config) {
    this.setState({ config });
  }

  renderStatic() {
    const onSelect = (value, name) => {
      this.onChange({ ...this.state.config, [name]: value });
    };

    return (
      <Padding>
        <FormGroup>
          <ControlLabel>{__('Team Members')}</ControlLabel>
          <SelectTeamMembers
            name="teamMemberIds"
            label="select team members"
            multi
            onSelect={onSelect}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Customers')}</ControlLabel>
          <SelectCustomers
            name="customerIds"
            label="select customers"
            multi
            onSelect={onSelect}
          />
        </FormGroup>
      </Padding>
    );
  }

  renderSettings() {
    const { useCustomConfig, config } = this.state;

    const handleChange = e => {
      const { value } = e.currentTarget as HTMLInputElement;

      this.setState({ config: { ...config, customConfig: value } });
    };

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
              onChange={() =>
                this.setState({ useCustomConfig: !useCustomConfig })
              }
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
                onChange={handleChange}
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
  }

  renderGeneral() {
    const { triggerType } = this.props;
    const { config } = this.state;
    const isAviableTriggerExcutor = ['contacts', 'user'].some(c =>
      triggerType.includes(c)
    );

    const customAttributions = isAviableTriggerExcutor
      ? [
          {
            _id: String(Math.random()),
            label: 'Trigger Executor',
            name: 'triggerExecutor',
            type: 'segment'
          }
        ]
      : [];

    return (
      <>
        <PlaceHolderInput
          triggerType={triggerType}
          config={config}
          inputName="sendTo"
          attrTypes={['user', 'contact', 'segment']}
          label="Send To"
          onChange={this.onChange}
          customAttributions={customAttributions}
          required
        />
      </>
    );
  }

  renderTabContent() {
    const { currentTab } = this.state;

    switch (currentTab) {
      case 'general':
        return this.renderGeneral();
      case 'static':
        return this.renderStatic();
      default:
        return null;
    }
  }

  renderMainContent() {
    const { triggerType } = this.props;
    const { config } = this.state;

    return (
      <>
        <PlaceHolderInput
          inputName="subject"
          label="Subject"
          config={config}
          onChange={this.onChange}
          triggerType={triggerType}
          required
        />
        <PlaceHolderInput
          inputName="body"
          label="Body"
          config={config}
          onChange={this.onChange}
          triggerType={triggerType}
          required
        />
      </>
    );
  }

  render() {
    const { closeModal, addAction, activeAction } = this.props;
    const { config, currentTab } = this.state;

    const handleTab = value => {
      const { sendTo, teamMemberIds, customerIds, ...obj } = config;

      this.setState({
        config: { ...obj },
        currentTab: value
      });
    };

    const isActiveTab = value => {
      return currentTab === value ? 'active' : '';
    };

    return (
      <DrawerDetail>
        <Common
          closeModal={closeModal}
          addAction={addAction}
          activeAction={activeAction}
          config={config}
        >
          <TopContainer>{this.renderSettings()}</TopContainer>
          <Tabs full>
            <TabTitle
              className={isActiveTab('general')}
              onClick={handleTab.bind(this, 'general')}
            >
              {__('General')}
            </TabTitle>
            <TabTitle
              className={isActiveTab('static')}
              onClick={handleTab.bind(this, 'static')}
            >
              {__('Static')}
            </TabTitle>
          </Tabs>
          <Padding>{this.renderTabContent()}</Padding>
          <Padding>{this.renderMainContent()}</Padding>
        </Common>
      </DrawerDetail>
    );
  }
}

export default SendNotification;
