import React from 'react';
import { __ } from 'modules/common/utils';
import { IAction } from 'modules/automations/types';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';

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

    console.log(name, value);

    this.setState({ config });
  };

  onSave = () => {
    const { addAction, activeAction, closeModal } = this.props;
    const { config } = this.state;

    addAction(activeAction, '', activeAction.id, config);

    closeModal();
  };

  render() {
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
            <option value="contact">Company</option>
            <option value="contact">Contact</option>
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
          </select>
        </p>

        <p>
          <label>Operator</label>

          <select
            onChange={onChangeSelect.bind(this, 'operator')}
            value={config.operator}
          >
            <option value="">Choose operator</option>
            <option value="add">Add</option>
            <option value="subtract">Subtract</option>
          </select>
        </p>

        <p>
          <label>Value</label>

          <input onChange={onChangeValue} value={config.value} />
        </p>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button btnStyle="success" icon="checked-1" onClick={this.onSave}>
            Save
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default SetProperty;
