import dayjs from 'dayjs';
import Assignees from 'modules/boards/components/Assignees';
import Details from 'modules/boards/components/Details';
import DueDateLabel from 'modules/boards/components/DueDateLabel';
import Labels from 'modules/boards/components/label/Labels';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemDate } from 'modules/boards/styles/common';
import { LastUpdate, Left, PriceContainer } from 'modules/boards/styles/item';
import { IItem, IOptions } from 'modules/boards/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import PriorityIndicator from '../editForm/PriorityIndicator';

type Props = {
  stageId?: string;
  onClick?: () => void;
  item: IItem;
  isFormVisible?: boolean;
  options?: IOptions;
  groupType?: string;
};

class ListItemRow extends React.PureComponent<Props> {
  renderDate(date) {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format('lll')}</ItemDate>;
  }

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

  renderLabel = () => {
    const { item, groupType } = this.props;
    if (groupType === 'assignee' || groupType === 'dueDate') {
      return (
        <td>
          {item.labels.length > 0 ? <Labels labels={item.labels} /> : '-'}
        </td>
      );
    }

    return null;
  };

  renderAssign = () => {
    const { item, groupType } = this.props;
    if (groupType === 'assignee') {
      return null;
    }

    return (
      <td>
        {item.assignedUsers.length ? (
          <PriceContainer>
            <Left>
              <Assignees users={item.assignedUsers} />
            </Left>
          </PriceContainer>
        ) : (
          '-'
        )}
      </td>
    );
  };

  renderStage = () => {
    const { item, groupType } = this.props;
    if (groupType === 'stage') {
      return (
        <>{item.labels.length > 0 ? <Labels labels={item.labels} /> : '-'}</>
      );
    }

    return item.stage ? item.stage.name : '-';
  };

  render() {
    const styleTr = {
      cursor: 'pointer'
    };
    const { item, onClick, groupType } = this.props;
    const { customers, companies, closeDate, isComplete, priority } = item;

    return (
      <>
        <tr onClick={onClick} key={item._id} style={styleTr}>
          <td>
            <h5>{item.name}</h5>
            <LastUpdate>
              {__('Last updated')}: {this.renderDate(item.modifiedAt)}
            </LastUpdate>
          </td>
          <td>{this.renderStage()}</td>
          {this.renderLabel()}
          <td>
            {groupType === 'priority' ? (
              <Labels labels={item.labels} />
            ) : priority ? (
              <PriorityIndicator isFullBackground={true} value={priority} />
            ) : (
              '-'
            )}
          </td>
          <td>
            {closeDate || isComplete ? (
              <DueDateLabel closeDate={closeDate} isComplete={isComplete} />
            ) : (
              '-'
            )}
          </td>
          {this.renderAssign()}
          <td>
            {item.customers ? (
              <Details color="#F7CE53" items={customers || []} />
            ) : (
              '-'
            )}
          </td>
          <td>
            {item.customers ? (
              <Details color="#EA475D" items={companies || []} />
            ) : (
              '-'
            )}
          </td>
        </tr>
        {this.renderForm()}
      </>
    );
  }
}

export default ListItemRow;
