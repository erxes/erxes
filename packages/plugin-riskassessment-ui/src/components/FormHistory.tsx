import { SidebarContent } from '@erxes/ui-forms/src/settings/properties/styles';
import {
  CollapseContent,
  ControlLabel,
  FieldStyle,
  getUserAvatar,
  NameCard,
  Tabs,
  TabTitle,
  __
} from '@erxes/ui/src';
import { Flex } from '@erxes/ui/src/styles/main';
import React from 'react';
import { Divider, FormContainer, Padding, TriggerTabs } from '../styles';

type Props = {
  detail: any;
};

type State = {
  currentTab: string;
};

class FormHistory extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: ''
    };
  }

  renderUserSubmitDetail(currentTab: string) {
    const { detail } = this.props;

    const { users } = detail;

    const result = users.find(({ _id }) => _id === currentTab);

    if (!result) {
      return null;
    }

    const { fields } = result;

    return (
      <Padding vertical>
        {fields.map(field => {
          return (
            <CollapseContent
              key={field?.fieldId}
              beforeTitle={<ControlLabel>{`${field?.text}: ${field?.value}`}</ControlLabel>}
              title={''}
              compact
            >
              {(field.optionsValues || []).map(value => (
                <p key={Math.random()}>{__(value)}</p>
              ))}
            </CollapseContent>
          );
        })}
      </Padding>
    );
  }

  renderUsersSubmit() {
    const { detail } = this.props;
    const { currentTab } = this.state;

    const { users } = detail;

    const handleTab = currentTab => {
      this.setState({ currentTab });
    };

    return (
      <>
        <TriggerTabs>
          <Tabs full={true}>
            {users.map(({ user, _id }) => (
              <TabTitle
                key={Math.random()}
                className={currentTab === _id ? 'active' : ''}
                onClick={handleTab.bind(this, _id)}
              >
                <NameCard user={user} />
              </TabTitle>
            ))}
          </Tabs>
        </TriggerTabs>
        {currentTab !== '' && this.renderUserSubmitDetail(currentTab)}
      </>
    );
  }

  renderContent() {
    const { detail } = this.props;

    const { riskAssessment, card, cardType } = detail;

    return (
      <>
        <FormContainer column gap>
          <ControlLabel>{__(`Risk Assessment Name: ${riskAssessment.name || ''}`)}</ControlLabel>
          <ControlLabel>{__(`${cardType} Name: ${card.name || ''}`)}</ControlLabel>
        </FormContainer>
        {this.renderUsersSubmit()}
      </>
    );
  }

  render() {
    return <>{this.renderContent()}</>;
  }
}
export default FormHistory;
