import React from 'react';
import { IAction } from 'modules/automations/types';
import Common from './Common';

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  addAction: (
    action: IAction,
    contentId?: string,
    actionId?: string,
    config?: any
  ) => void;
};

type State = {
  config: any;
};

class SetProperty extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { config = {} } = this.props.activeAction;

    this.state = {
      config
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeAction !== this.props.activeAction) {
      this.setState({ config: nextProps.activeAction.config });
    }
  }

  onChangeField = (name: string, value: string) => {
    const { config } = this.state;
    config[name] = value;

    this.setState({ config });
  };

  renderContent() {
    const { config } = this.state;
    const onChangeSelect = (field, e) =>
      this.onChangeField(field, e.target.value);
    const onChangeValue = e => this.onChangeField('value', e.target.value);

    return (
      <>
        <p>
          <label>Module</label>

          <select
            onChange={onChangeSelect.bind(this, 'module')}
            value={config.module}
          >
            <option value="">Choose module</option>
            <option value="company">Company</option>
            <option value="customer">Customer</option>
            <option value="deal">Deal</option>
            <option value="task">Task</option>
            <option value="ticket">Ticket</option>
            <option value="conversation">Conversation</option>
          </select>
        </p>

        <p>
          <label>Field</label>

          <select
            onChange={onChangeSelect.bind(this, 'field')}
            value={config.field}
          >
            <option value="">Choose field</option>
            <option value="size">size</option>
            <option value="amount">amount</option>
            <option value="state">state</option>
          </select>
        </p>

        <p>
          <label>Operator</label>

          <select
            onChange={onChangeSelect.bind(this, 'operator')}
            value={config.operator}
          >
            <option value="">Choose operator</option>
            <option value="set">Set</option>
            <option value="add">Add</option>
            <option value="subtract">Subtract</option>
          </select>
        </p>

        <p>
          <label>Value</label>

          <input onChange={onChangeValue} value={config.value} />
        </p>
      </>
    );
  }

  render() {
    return (
      <Common config={this.state.config} {...this.props}>
        {this.renderContent()}
      </Common>
    );
  }
}

export default SetProperty;
