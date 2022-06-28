import React from 'react';

import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';

import { IJob } from '../../../../flow/types';
import { ACTIONS } from '../../../constants';
import { ScrolledContent } from '../../../styles';
import { ActionBox } from './styles';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  onClickAction: (action: IJob) => void;
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

  onFavourite = (action, e) => {
    e.stopPropagation();

    this.setState({ isFavourite: !this.state.isFavourite });

    const actionsLocalStorage =
      localStorage.getItem('automations_favourite_actions') || '[]';

    let actions = JSON.parse(actionsLocalStorage);

    if (actions.find(item => item.type === action.type)) {
      actions = actions.filter(item => item.type !== action.type);
    } else {
      actions.push(action);
    }

    localStorage.setItem(
      'automations_favourite_actions',
      JSON.stringify(actions)
    );
  };

  renderBox(action, isFavourite, index) {
    const { onClickAction } = this.props;

    return (
      <ActionBox
        key={index}
        onClick={onClickAction.bind(this, action)}
        isFavourite={isFavourite}
        isAvailable={action.isAvailable}
      >
        <Icon icon={action.icon} size={30} />
        <div>
          <b>{__(action.label)}</b>
          {!action.isAvailable && <span>{__('Coming soon')}</span>}
          <p>{__(action.description)}</p>
        </div>
        <Tip
          text={isFavourite ? __('Unfavourite') : __('Favourite')}
          placement="top"
        >
          <div
            className="favourite-action"
            onClick={this.onFavourite.bind(this, action)}
          >
            <Icon icon="star" size={20} />
          </div>
        </Tip>
      </ActionBox>
    );
  }

  renderContent() {
    const localStorageActions = JSON.parse(
      localStorage.getItem('automations_favourite_actions') || '[]'
    );

    const actions =
      this.state.currentTab === 'favourite' ? localStorageActions : ACTIONS;

    if (actions.length === 0 && localStorageActions.length === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="Add your favourite actions"
          size="small"
        />
      );
    }

    return actions.map((action, index) => {
      const isFavourite = localStorageActions.some(
        item => item.type === action.type
      );

      return (
        <React.Fragment key={index}>
          {this.renderBox(action, isFavourite, index)}
        </React.Fragment>
      );
    });
  }

  render() {
    return (
      <>
        <ScrolledContent>{this.renderContent()}</ScrolledContent>
      </>
    );
  }
}

export default ActionsForm;
