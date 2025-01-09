import EmptyState from '@erxes/ui/src/components/EmptyState';
import Label from '@erxes/ui/src/components/Label';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';
import React from 'react';
import {
  IAutomation,
  IAutomationHistory,
  IAutomationHistoryAction
} from '../../types';
import { renderDynamicComponent } from '../../utils';
import SendEmail from './components/SendEmail';
import { Button, ModalTrigger } from '@erxes/ui/src';
import Preview from './Preview';

type Props = {
  history: IAutomationHistory;
  actionsByType: any;
  triggersByType: any;
  automation: IAutomation;
  constants: any;
};

type State = {
  isShowDetail: boolean;
};

export const generateActionResult = (
  action: IAutomationHistoryAction,
  hideTemplate?: boolean
) => {
  if (!action.result) {
    return 'Result has not been recorded yet';
  }

  const { result } = action;

  if (result.error) {
    return result.error;
  }

  if (action.actionType === 'setProperty') {
    return `Update for ${(result.result || []).length} ${
      result.module
    }: ${result.fields || ''}, (${result.result.map(
      r => (r.error && r.error) || ''
    )})`;
  }

  if (action.actionType === 'if') {
    return `Condition: ${result.condition}`;
  }

  if (action.actionType === 'sendEmail') {
    return (
      <SendEmail result={result} action={action} hideTemplate={hideTemplate} />
    );
  }

  const Component = renderDynamicComponent(
    {
      action,
      result: action.result,
      componentType: 'historyActionResult'
    },
    action.actionType
  );

  if (Component) {
    return Component;
  }

  return JSON.stringify(result);
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

    const Component = renderDynamicComponent(
      {
        target,
        triggerType,
        componentType: 'historyName'
      },
      triggerType
    );

    if (Component) {
      return Component;
    }

    return '';
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
          <td colSpan={3}>{__('Results')}</td>
        </tr>

        {actions.map(action => (
          <tr key={action.actionId}>
            <td>{}</td>
            <td>{dayjs(action.createdAt).format('lll')}</td>
            <td>{__(actionsByType[action.actionType])}</td>
            <td colSpan={3}>{generateActionResult(action, true)}</td>
          </tr>
        ))}
      </>
    );
  };

  renderPreview() {
    const { automation, constants, history } = this.props;

    const updatedProps = {
      automation,
      constants,
      history
    };

    const content = ({}) => <Preview {...updatedProps} />;

    return (
      <ModalTrigger
        title=""
        size="xl"
        content={content}
        trigger={<Button btnStyle="white" icon="eye" />}
      />
    );
  }

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
        <tr id={_id} key={_id}>
          <td>{this.generateName()}</td>
          <td>{description}</td>
          <td>{triggersByType[triggerType]}</td>
          <td>
            <Label lblStyle={labelStyle}>{status}</Label>
          </td>
          <td>{dayjs(createdAt).format('lll')}</td>
          <td>
            {this.renderPreview()}
            <Button btnStyle="simple" icon="downarrow-2" onClick={trClick} />
          </td>
        </tr>
        {this.renderDetail()}
      </>
    );
  }
}

export default HistoryRow;
