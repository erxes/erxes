import dayjs from 'dayjs';
import {
  IAutomationHistory,
  IAutomationHistoryAction
} from 'modules/automations/types';
import { __, renderFullName } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from 'modules/common/components/EmptyState';
import Label from 'modules/common/components/Label';

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
        let title: string = target.content || 'Conversation';
        title = title.length > 100 ? `${title.substring(0, 200)}...` : title;
        return (
          <Link target="_blank" to={`/inbox/index?_id=${target._id}`}>
            {title}
          </Link>
        );
      }

      default: {
        return '';
      }
    }
  };

  generateActionResult = (action: IAutomationHistoryAction) => {
    if (!action.result) {
      return 'Result has not been recorded yet';
    }

    if (action.result.error) {
      return action.result.error;
    }

    const { result } = action;

    if (
      ['createTask', 'createDeal', 'createTicket'].includes(action.actionType)
    ) {
      const type = action.actionType.substr(6).toLowerCase();
      return (
        <Link
          target="_blank"
          to={`/${type}/board?_id=${result.boardId}&itemId=${result.itemId}&key=&pipelineId=${result.pipelineId}`}
        >
          {`Created ${type}: ${result.name}`}
        </Link>
      );
    }

    if (action.actionType === 'setProperty') {
      return `Update for ${(result.result || []).length} ${result.module}: ${(
        result.fields || []
      ).join(', ')}, (${result.result.map(r => (r.error && r.error) || '')})`;
    }

    if (action.actionType === 'if') {
      return `Condition: ${result.condition}`;
    }

    return JSON.stringify(result);
  };

  renderDetail = () => {
    const { isShowDetail } = this.state;

    if (!isShowDetail) {
      return null;
    }

    const { history, actionsByType } = this.props;
    const { actions = [] } = history;

    if (!actions || actions.length === 0) {
      return (
        <tr key={Math.random()}>
          <td colSpan={5}>
            <EmptyState icon="book" text="Item has not been created yet" />
          </td>
        </tr>
      );
    }

    return (
      <>
        <tr key={Math.random()} style={{ backgroundColor: '#ececec' }}>
          <td>{}</td>
          <td>{__('Sub Time')}</td>
          <td>{__('Action Type')}</td>
          <td colSpan={2}>{__('Results')}</td>
        </tr>

        {actions.map(action => (
          <tr key={action.actionId}>
            <td>{}</td>
            <td>{dayjs(action.createdAt).format('lll')}</td>
            <td>{actionsByType[action.actionType]}</td>
            <td colSpan={2}>{this.generateActionResult(action)}</td>
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

    const isActive = status === 'active' ? true : false;
    const labelStyle = isActive ? 'success' : 'warning';

    return (
      <>
        <tr id={_id} key={_id} onClick={trClick}>
          <td>{this.generateName()}</td>
          <td>{description}</td>
          <td>{triggersByType[triggerType]}</td>
          <td>
            <Label lblStyle={labelStyle}>{status}</Label>
          </td>
          <td>{dayjs(createdAt).format('lll')}</td>
        </tr>
        {this.renderDetail()}
      </>
    );
  }
}

export default HistoryRow;
