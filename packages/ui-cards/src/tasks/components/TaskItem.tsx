import { colors } from '@erxes/ui/src/styles';
import React from 'react';

import Assignees from '../../boards/components/Assignees';
import Details from '../../boards/components/Details';
import DueDateLabel from '../../boards/components/DueDateLabel';
import Labels from '../../boards/components/label/Labels';
import ItemFooter from '../../boards/components/portable/ItemFooter';
import EditForm from '../../boards/containers/editForm/EditForm';
import { ItemContainer } from '../../boards/styles/common';
import { PriceContainer, Right } from '../../boards/styles/item';
import { Content } from '../../boards/styles/stage';
import { IItem, IOptions } from '../../boards/types';
import { renderPriority } from '../../boards/utils';

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
    const {
      customers,
      companies,
      closeDate,
      isComplete,
      customProperties
    } = item;

    return (
      <>
        <h5>
          {renderPriority(item.priority)}
          {item.name}
        </h5>

        <Details color="#F7CE53" items={customers || []} />
        <Details color="#EA475D" items={companies || []} />
        <Details
          color={colors.colorCoreOrange}
          items={customProperties || []}
        />

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
