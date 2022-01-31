import React from 'react';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import { __, confirm } from 'modules/common/utils';
import { TRIGGERS } from 'modules/automations/constants';
import {
  TypeBox,
  ScrolledContent,
  Description,
  TriggerTabs,
  TypeBoxContainer
} from 'modules/automations/styles';
import { ITrigger } from 'modules/automations/types';
import gql from 'graphql-tag';
import { mutations, queries } from 'modules/automations/graphql';
import Icon from 'modules/common/components/Icon';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import client from 'erxes-ui/lib/apolloClient';

type Props = {
  onClickTrigger: (trigger: ITrigger) => void;
  templates: any[];
};

type State = {
  currentTab: string;
  currentType: string;
};

class TriggerForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'new',
      currentType: 'customer'
    };
  }

  tabOnClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  onClickType = (trigger: ITrigger) => {
    const { onClickTrigger } = this.props;

    this.setState({ currentType: trigger.type }, () => {
      onClickTrigger(trigger);
    });
  };

  onClickTemplate = (template: any) => {
    client
      .mutate({
        mutation: gql(mutations.automationsCreateFromTemplate),
        variables: {
          _id: template._id
        }
      })
      .then(({ data }) => {
        window.location.href = `/automations/details/${data.automationsCreateFromTemplate._id}`;
      });
  };

  onRemoveTemplate = (templateId: string) => {
    confirm().then(() => {
      client.mutate({
        mutation: gql(mutations.automationsRemove),
        variables: {
          automationIds: [templateId]
        },
        refetchQueries: [
          {
            query: gql(queries.automations),
            variables: {
              status: 'template'
            }
          }
        ]
      });
    });
  };

  renderTriggerItem(trigger: any, index: number) {
    return (
      <TypeBox key={index} onClick={this.onClickType.bind(this, trigger)}>
        <img src={`/images/actions/${trigger.img}`} alt={trigger.label} />
        <FormGroup>
          <ControlLabel>
            {trigger.label} {__('based')}
          </ControlLabel>
          <p>{trigger.description}</p>
        </FormGroup>
      </TypeBox>
    );
  }

  renderTemplateItem(template: any, index: number) {
    return (
      <TypeBoxContainer key={index}>
        <TypeBox onClick={this.onClickTemplate.bind(this, template)}>
          <FormGroup>
            <ControlLabel>{__(template.name)}</ControlLabel>
          </FormGroup>
        </TypeBox>
        <div className="ctrl">
          <Icon
            icon="trash"
            color="#EA475D"
            size={16}
            onClick={this.onRemoveTemplate.bind(this, template._id)}
          />
        </div>
      </TypeBoxContainer>
    );
  }

  renderTabContent() {
    if (this.state.currentTab === 'library') {
      return this.props.templates.map((t, index) =>
        this.renderTemplateItem(t, index)
      );
    }

    return TRIGGERS.map((trigger, index) =>
      this.renderTriggerItem(trigger, index)
    );
  }

  render() {
    const { currentTab } = this.state;

    return (
      <>
        <Description>
          <h4>{__('Choose your trigger type')}</h4>
          <p>
            {__('Start with an automation type that enrolls and triggers off')}
          </p>
        </Description>
        <TriggerTabs>
          <Tabs full={true}>
            <TabTitle
              className={currentTab === 'new' ? 'active' : ''}
              onClick={this.tabOnClick.bind(this, 'new')}
            >
              {__('Start from scratch')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'library' ? 'active' : ''}
              onClick={this.tabOnClick.bind(this, 'library')}
            >
              {__('Library')}
            </TabTitle>
          </Tabs>
        </TriggerTabs>
        <ScrolledContent>{this.renderTabContent()}</ScrolledContent>
      </>
    );
  }
}

export default TriggerForm;
