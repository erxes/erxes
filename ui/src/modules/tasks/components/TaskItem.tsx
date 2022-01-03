import Assignees from 'modules/boards/components/Assignees';
import Details from 'modules/boards/components/Details';
import DueDateLabel from 'modules/boards/components/DueDateLabel';
import Labels from 'modules/boards/components/label/Labels';
import ItemFooter from 'modules/boards/components/portable/ItemFooter';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemContainer } from 'modules/boards/styles/common';
import { PriceContainer, Right } from 'modules/boards/styles/item';
import { Content } from 'modules/boards/styles/stage';
import { IItem, IOptions } from 'modules/boards/types';
import { renderPriority } from 'modules/boards/utils';
import React from 'react';

type Props = {
  stageId?: string;
  item: IItem;
  onClick?: () => void;
  isFormVisible?: boolean;
  beforePopupClose?: () => void;
  options?: IOptions;
  portable?: boolean;
  onAdd?: (stageId: string, item: IItem) => void;
  onRemove?: (taskId: string, stageId: string) => void;
  onUpdate?: (item: IItem) => void;
};

class TaskItem extends React.PureComponent<Props> {
  renderForm = () => {
    const { item, isFormVisible, stageId } = this.props;

    if (!isFormVisible) {
      return null;
    }

    return (
      <EditForm
        {...this.props}
        stageId={stageId || item.stageId}
        itemId={item._id}
        hideHeader={true}
        isPopupVisible={isFormVisible}
      />
    );
  };

  renderContent() {
    const { item } = this.props;
    const { customers, companies, closeDate, isComplete } = item;

    return (
      <>
        <h5>
          {renderPriority(item.priority)}
          {item.name}
        </h5>

        <Details color="#F7CE53" items={customers || []} />
        <Details color="#EA475D" items={companies || []} />

        <PriceContainer>
          <Right>
            <Assignees users={item.assignedUsers} />
          </Right>
        </PriceContainer>

        <DueDateLabel closeDate={closeDate} isComplete={isComplete} />

        <ItemFooter item={item} />
      </>
    );
  }

  render() {
    const { item, portable, onClick } = this.props;

    if (portable) {
      return (
        <>
          <ItemContainer onClick={onClick}>
            <Content>{this.renderContent()}</Content>
          </ItemContainer>
          {this.renderForm()}
        </>
      );
    }

    return (
      <>
        <Labels labels={item.labels} indicator={true} />
        <Content onClick={onClick}>{this.renderContent()}</Content>
        {this.renderForm()}
      </>
    );
  }
}

export default TaskItem;
