import { IUser } from 'modules/auth/types';
import EditForm from 'modules/boards/components/editForm/EditForm';
import Left from 'modules/boards/components/editForm/Left';
import PriorityIndicator from 'modules/boards/components/editForm/PriorityIndicator';
import Sidebar from 'modules/boards/components/editForm/Sidebar';
import Top from 'modules/boards/components/editForm/Top';
import { PRIORITIES } from 'modules/boards/constants';
import { FlexContent } from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ISelectedOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import PortableDeals from 'modules/deals/components/PortableDeals';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';
import Select from 'react-select-plus';
import { ITask, ITaskParams } from '../types';

type Props = {
  options: IOptions;
  item: ITask;
  users: IUser[];
  addItem: (doc: ITaskParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: ITaskParams, callback?: (item) => void) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  beforePopupClose: () => void;
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

    const priorityValues = PRIORITIES.map(p => ({ label: __(p), value: p }));

    const onChangePriority = (option: ISelectedOption) => {
      this.props.saveItem({ priority: option ? option.value : '' }, () =>
        this.onChangeField('priority', option ? option.value : '')
      );
    };

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
            placeholder={__('Select a priority')}
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

  renderItems = () => {
    return (
      <>
        <PortableDeals mainType="task" mainTypeId={this.props.item._id} />
        <PortableTickets mainType="task" mainTypeId={this.props.item._id} />
      </>
    );
  };

  renderFormContent = ({
    state,
    onChangeAttachment,
    onChangeField,
    copy,
    remove,
    onBlurFields
  }: IEditFormContent) => {
    const { item, users, options } = this.props;

    const {
      name,
      stageId,
      description,
      closeDate,
      assignedUserIds,
      attachments,
      isComplete,
      reminderMinute
    } = state;

    return (
      <>
        <Top
          options={options}
          name={name}
          closeDate={closeDate}
          users={users}
          stageId={stageId}
          item={item}
          onChangeField={onChangeField}
          onBlurFields={onBlurFields}
          isComplete={isComplete}
          reminderMinute={reminderMinute}
        />

        <FlexContent>
          <Left
            onChangeAttachment={onChangeAttachment}
            type={options.type}
            labels={state.labels}
            description={description}
            attachments={attachments}
            item={item}
            onChangeField={onChangeField}
            onBlurFields={onBlurFields}
          />

          <Sidebar
            options={options}
            assignedUserIds={assignedUserIds}
            item={item}
            sidebar={this.renderSidebarFields}
            onChangeField={onChangeField}
            copyItem={copy}
            removeItem={remove}
            renderItems={this.renderItems}
          />
        </FlexContent>
      </>
    );
  };

  render() {
    const extendedProps = {
      ...this.props,
      formContent: this.renderFormContent,
      sidebar: this.renderSidebarFields,
      extraFields: this.state
    };

    return <EditForm {...extendedProps} />;
  }
}
