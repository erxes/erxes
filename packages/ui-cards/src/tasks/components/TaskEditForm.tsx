import EditForm from '../../boards/components/editForm/EditForm';
import Left from '../../boards/components/editForm/Left';
import Sidebar from '../../boards/components/editForm/Sidebar';
import Top from '../../boards/components/editForm/Top';
import { Flex } from '@erxes/ui/src/styles/main';
import {
  IEditFormContent,
  IItem,
  IItemParams,
  IOptions
} from '../../boards/types';
import PortableDeals from '../../deals/components/PortableDeals';
import PortablePurchases from '../../purchases/components/PortablePurchases';
import PortableTickets from '../../tickets/components/PortableTickets';
import React from 'react';
import { pluginsOfItemSidebar } from 'coreui/pluginUtils';
import queryString from 'query-string';
import ChildrenSection from '../../boards/containers/editForm/ChildrenSection';

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

type State = {
  refresh: boolean;
};

export default class TaskEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      refresh: false
    };
  }

  onChangeRefresh = () => {
    this.setState({
      refresh: !this.state.refresh
    });
  };

  renderItems = () => {
    return (
      <>
        <PortableDeals mainType="task" mainTypeId={this.props.item._id} />
        <PortableTickets mainType="task" mainTypeId={this.props.item._id} />
        <PortablePurchases mainType="task" mainTypeId={this.props.item._id} />
        {pluginsOfItemSidebar(this.props.item, 'task')}
      </>
    );
  };

  renderChildrenSection = () => {
    const { item } = this.props;

    const updatedProps = {
      ...this.props,
      type: 'task',
      itemId: item._id,
      stageId: item.stageId,
      pipelineId: item.pipeline._id,
      queryParams: queryString.parse(window.location.search) || {}
    };

    return <ChildrenSection {...updatedProps} />;
  };

  renderFormContent = ({
    state,
    copy,
    remove,
    saveItem,
    onChangeStage
  }: IEditFormContent) => {
    const {
      item,
      options,
      onUpdate,
      addItem,
      sendToBoard,
      updateTimeTrack
    } = this.props;

    return (
      <>
        <Top
          options={options}
          stageId={state.stageId}
          item={item}
          saveItem={saveItem}
          onChangeStage={onChangeStage}
        />

        <Flex>
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
            onChangeRefresh={this.onChangeRefresh}
          />

          <Sidebar
            options={options}
            item={item}
            saveItem={saveItem}
            updateTimeTrack={updateTimeTrack}
            renderItems={this.renderItems}
            childrenSection={this.renderChildrenSection}
          />
        </Flex>
      </>
    );
  };

  render() {
    const extendedProps = {
      ...this.props,
      formContent: this.renderFormContent,
      extraFields: this.state,
      refresh: this.state.refresh
    };

    return <EditForm {...extendedProps} />;
  }
}
