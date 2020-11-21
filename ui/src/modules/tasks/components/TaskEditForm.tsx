import EditForm from 'modules/boards/components/editForm/EditForm';
import Left from 'modules/boards/components/editForm/Left';
import Sidebar from 'modules/boards/components/editForm/Sidebar';
import Top from 'modules/boards/components/editForm/Top';
import { FlexContent } from 'modules/boards/styles/item';
import {
  IEditFormContent,
  IItem,
  IItemParams,
  IOptions
} from 'modules/boards/types';
import TaskTimer, { STATUS_TYPES } from 'modules/common/components/Timer';
import PortableDeals from 'modules/deals/components/PortableDeals';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';

type Props = {
  options: IOptions;
  item: IItem;
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: IItemParams, callback?: (item) => void) => void;
  copyItem: (itemId: string, callback: () => void) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  onUpdate: (item: IItem, prevStageId?: string) => void;
  updateTimeTrack: (
    {
      _id,
      status,
      timeSpent
    }: { _id: string; status: string; timeSpent: number; startDate?: string },
    callback?: () => void
  ) => void;
  beforePopupClose: () => void;
  sendToBoard?: (item: any) => void;
};

export default class TaskEditForm extends React.Component<Props> {
  renderItems = () => {
    const { item, updateTimeTrack } = this.props;

    const timeTrack = item.timeTrack || {
      timeSpent: 0,
      status: STATUS_TYPES.STOPPED
    };

    return (
      <>
        <TaskTimer
          taskId={item._id}
          status={timeTrack.status}
          timeSpent={timeTrack.timeSpent}
          startDate={timeTrack.startDate}
          update={updateTimeTrack}
        />
        <PortableDeals mainType="task" mainTypeId={this.props.item._id} />
        <PortableTickets mainType="task" mainTypeId={this.props.item._id} />
      </>
    );
  };

  renderFormContent = ({
    state,
    copy,
    remove,
    saveItem,
    onChangeStage
  }: IEditFormContent) => {
    const { item, options, onUpdate, addItem, sendToBoard } = this.props;

    return (
      <>
        <Top
          options={options}
          stageId={state.stageId}
          item={item}
          saveItem={saveItem}
          onChangeStage={onChangeStage}
        />

        <FlexContent>
          <Left
            options={options}
            saveItem={saveItem}
            copyItem={copy}
            removeItem={remove}
            onUpdate={onUpdate}
            sendToBoard={sendToBoard}
            item={item}
            addItem={addItem}
            onChangeStage={onChangeStage}
          />

          <Sidebar
            options={options}
            item={item}
            saveItem={saveItem}
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
      extraFields: this.state
    };

    return <EditForm {...extendedProps} />;
  }
}
