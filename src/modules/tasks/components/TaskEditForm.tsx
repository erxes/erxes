import { IUser } from 'modules/auth/types';
import EditForm from 'modules/boards/components/editForm/EditForm';
import PriorityIndicator from 'modules/boards/components/editForm/PriorityIndicator';
import { PRIORITIES } from 'modules/boards/constants';
import { IOptions } from 'modules/boards/types';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ISelectedOption } from 'modules/common/types';
import React from 'react';
import Select from 'react-select-plus';
import { ITask, ITaskParams } from '../types';

type Props = {
  options: IOptions;
  item: ITask;
  users: IUser[];
  addItem: (doc: ITaskParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: ITaskParams, callback: () => void) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  closeModal: () => void;
};

type State = {
  priority: string;
};

export default class TaskEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      priority: item.priority || ''
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  renderSidebarFields = () => {
    const { priority } = this.state;

    const priorityValues = PRIORITIES.map(p => ({ label: p, value: p }));

    const onChangePriority = (option: ISelectedOption) =>
      this.onChangeField('priority', option ? option.value : '');

    const priorityValueRenderer = (
      option: ISelectedOption
    ): React.ReactNode => (
      <>
        <PriorityIndicator value={option.value} /> {option.label}
      </>
    );

    return (
      <>
        <FormGroup>
          <ControlLabel>Priority</ControlLabel>
          <Select
            placeholder="Select a priority"
            value={priority}
            options={priorityValues}
            onChange={onChangePriority}
            optionRenderer={priorityValueRenderer}
            valueRenderer={priorityValueRenderer}
          />
        </FormGroup>
      </>
    );
  };

  render() {
    const extendedProps = {
      ...this.props,
      sidebar: this.renderSidebarFields,
      extraFields: this.state
    };

    return <EditForm {...extendedProps} />;
  }
}
