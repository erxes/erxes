import dayjs from 'dayjs';
import { IAutomationHistory } from 'modules/automations/types';
import { __, renderFullName } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  history: IAutomationHistory;
  actionsByType: any;
  triggersByType: any;
};

type State = {
  isShowDetail: boolean;
};

class HistoryRow extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isShowDetail: false
    };
  }

  generateName = () => {
    const { triggerType, target } = this.props.history;
    switch (triggerType) {
      case 'visitor':
      case 'lead':
      case 'customer': {
        return (
          <Link target="_blank" to={`/contacts/details/${target._id}`}>
            {renderFullName(target)}
          </Link>
        );
      }

      case 'company': {
        return (
          <Link target="_blank" to={`/companies/details/${target._id}`}>
            {target.name}
          </Link>
        );
      }

      case 'deal':
      case 'task':
      case 'ticket': {
        return target.name;
      }

      case 'conversation': {
        return (
          <Link target="_blank" to={`inbox/index?_id=${target._id}`}>
            {`${(target.content || 'Conversation').substr(1, 100)}...`}
          </Link>
        );
      }

      default: {
        return '';
      }
    }
  };

  renderDetail = () => {
    const { isShowDetail } = this.state;
    if (!isShowDetail) {
      return '';
    }

    const { history, actionsByType } = this.props;
    const { actions = [] } = history;

    if (!actions.length) {
      return (
        <tr key={Math.random()}>
          <td colSpan={5}> The item has not been created yet!!!</td>
        </tr>
      );
    }

    return (
      <>
        <tr key={Math.random()} style={{ backgroundColor: '#ececec' }}>
          <td>{}</td>
          <td colSpan={2}>{__('Sub Time')}</td>
          <td colSpan={2}>{__('Action Type')}</td>
        </tr>

        {actions.map(action => (
          <tr key={action.actionId}>
            <td>{}</td>
            <td colSpan={2}>{dayjs(action.createdAt).format('lll')}</td>
            <td colSpan={2}>{actionsByType[action.actionType]}</td>
          </tr>
        ))}
      </>
    );
  };

  render() {
    const { triggersByType, history } = this.props;
    const { _id, createdAt, triggerType, status, description } = history;

    const trClick = () => {
      const { isShowDetail } = this.state;
      this.setState({ isShowDetail: !isShowDetail });
    };

    return (
      <>
        <tr id={_id} key={_id} onClick={trClick}>
          <td>{dayjs(createdAt).format('lll')}</td>
          <td>{triggersByType[triggerType]}</td>
          <td>{this.generateName()}</td>
          <td>{status}</td>
          <td>{description}</td>
        </tr>
        {this.renderDetail()}
      </>
    );
  }
}

export default HistoryRow;
