import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import { IAction } from '@erxes/ui-automations/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import ModifiableList from '@erxes/ui/src/components/ModifiableList';
import dimensions from '@erxes/ui/src/styles/dimensions';
import colors from '@erxes/ui/src/styles/colors';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import React from 'react';
import styled from 'styled-components';
import { Container } from '../styles';
import Template from './Templates';
import { Config } from '../types';
import LinkAction from './LinkAction';

export const TabAction = styled.div`
  padding-left: ${dimensions.unitSpacing}px;
  color: ${colors.colorCoreGray};
  text-align: end;

  &:hover {
    cursor: pointer;
  }
`;

type Props = {
  onSave: () => void;
  closeModal: () => void;
  activeAction: IAction;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  triggerType: string;
};

type State = {
  config: Config;
  selectedTab: string;
  selectedTemplatePageId?: string;
};

const tableConst = [
  {
    label: 'Text',
    value: 'text'
  },
  {
    label: 'Message Template',
    value: 'messageTemplate'
  },
  {
    label: 'Quick Replies',
    value: 'quickReplies'
  }
];

const getSelectedTab = config => {
  if (config?.messageTemplate) {
    return 'messageTemplate';
  }

  if (config?.quickReplies) {
    return 'quickReplies';
  }

  if (config?.text) {
    return 'text';
  }

  return localStorage.getItem('fb_selected_message_action_tab') || '';
};

class ReplyFbMessage extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      config: props?.activeAction?.config || null,
      selectedTab: getSelectedTab(props?.activeAction?.config)
    };
  }

  renderQuickReplies(config) {
    const { triggerType } = this.props;
    const quickReplies = config?.quickReplies || [];

    const onChange = options => {
      const uniqueOptions = options
        .filter(
          option =>
            !quickReplies.find(quickReply => quickReply.label === option)
        )
        .map(opt => ({ _id: Math.random(), label: opt }));

      this.setState({
        config: {
          ...config,
          quickReplies: [...quickReplies, ...uniqueOptions]
        }
      });
    };

    return (
      <Container>
        <PlaceHolderInput
          config={config}
          triggerType={triggerType}
          inputName="text"
          label="Text"
          onChange={config => this.setState({ config })}
        />
        <ModifiableList
          options={
            quickReplies.map(quickReply => quickReply?.label || '') || []
          }
          onChangeOption={onChange}
        />
      </Container>
    );
  }

  renderContent(selectedTab) {
    const { config } = this.state;
    const { triggerType } = this.props;

    if (selectedTab === 'messageTemplate') {
      return (
        <Template
          config={config}
          onChangeConfig={config => this.setState({ config })}
        />
      );
    }

    if (selectedTab === 'quickReplies') {
      return this.renderQuickReplies(config);
    }

    if (selectedTab === 'text') {
      return (
        <Container>
          <PlaceHolderInput
            config={config}
            triggerType={triggerType}
            inputName="text"
            label="Reply Text"
            onChange={config => this.setState({ config })}
          />
        </Container>
      );
    }

    return null;
  }

  renderTabs() {
    const { selectedTab } = this.state;

    const onSelectTab = value => {
      const { text, quickReplies, messageTemplates, ...config } =
        this.state.config || {};

      localStorage.setItem('fb_selected_message_action_tab', value);
      this.setState({ selectedTab: value, config });
    };

    return (
      <>
        <Tabs full>
          {tableConst.map(({ value, label }) => (
            <TabTitle
              className={selectedTab === value ? 'active' : ''}
              onClick={onSelectTab.bind(this, value)}
            >
              {__(label)}
            </TabTitle>
          ))}
        </Tabs>
        {this.renderContent(selectedTab)}
      </>
    );
  }

  render() {
    const { activeAction, closeModal, addAction } = this.props;
    const { config } = this.state;

    return (
      <DrawerDetail>
        <Common
          closeModal={closeModal}
          addAction={addAction}
          activeAction={activeAction}
          config={config}
        >
          <FormGroup>
            <ControlLabel>{'From'}</ControlLabel>
            <SelectTeamMembers
              name="fromUserId"
              initialValue={config?.fromUserId}
              label="Select from user"
              onSelect={value =>
                this.setState({
                  config: { ...config, fromUserId: value as string }
                })
              }
              filterParams={{
                status: 'Verified'
              }}
              multi={false}
            />
          </FormGroup>
          {this.renderTabs()}
        </Common>
      </DrawerDetail>
    );
  }
}

export default ReplyFbMessage;
