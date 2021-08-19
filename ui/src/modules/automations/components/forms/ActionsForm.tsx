import { __ } from 'modules/common/utils';
import React from 'react';
import {
  ActionBox,
  TriggerTabs,
  ScrolledContent
} from 'modules/automations/styles';
import Icon from 'modules/common/components/Icon';
import { ACTIONS } from 'modules/automations/constants';
import { IAction } from 'modules/automations/types';
import { TabTitle, Tabs } from 'modules/common/components/tabs';
import Tip from 'modules/common/components/Tip';

type Props = {
  onClickAction: (action: IAction) => void;
};

type State = {
  currentTab: string;
  isFavourite: boolean;
};

class ActionsForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'actions',
      isFavourite: false
    };
  }

  tabOnClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  onFavourite = () => {
    this.setState({ isFavourite: !this.state.isFavourite });
  };

  renderBox(action, index) {
    const { onClickAction } = this.props;

    return (
      <ActionBox
        key={index}
        onClick={onClickAction.bind(this, action)}
        isFavourite={this.state.isFavourite}
      >
        <Icon icon={action.icon} size={30} />
        <div>
          <b>{__(action.label)}</b>
          <p>{__(action.description)}</p>
        </div>
        <Tip text="Favourite" placement="top">
          <div className="favourite-action" onClick={this.onFavourite}>
            <Icon icon="star" size={20} />
          </div>
        </Tip>
      </ActionBox>
    );
  }

  renderContent() {
    const actions =
      this.state.currentTab === 'favourite'
        ? JSON.parse(
            localStorage.getItem('automations_favourite_actions') || '[]'
          )
        : ACTIONS;

    return actions.map((action, index) => (
      <React.Fragment key={index}>
        {this.renderBox(action, index)}
      </React.Fragment>
    ));
  }

  render() {
    const { currentTab } = this.state;

    return (
      <>
        <TriggerTabs>
          <Tabs full={true}>
            <TabTitle
              className={currentTab === 'actions' ? 'active' : ''}
              onClick={this.tabOnClick.bind(this, 'actions')}
            >
              {__('Available actions')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'favourite' ? 'active' : ''}
              onClick={this.tabOnClick.bind(this, 'favourite')}
            >
              {__('Favourite')}
            </TabTitle>
          </Tabs>
        </TriggerTabs>
        <ScrolledContent>{this.renderContent()}</ScrolledContent>
      </>
    );
  }
}

export default ActionsForm;
