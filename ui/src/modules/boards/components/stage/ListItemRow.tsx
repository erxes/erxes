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

  renderStage = () => {
    const { item, groupType } = this.props;
    const { labels, stage } = item;

    if (groupType === 'stage') {
      return (
        <>
          {this.checkNull(
            Boolean(labels.length > 0),
            <Labels labels={labels} />
          )}
        </>
      );
    }

    return <h6>{stage ? stage.name : '-'}</h6>;
  };

  renderPriority = () => {
    const { item, groupType } = this.props;
    const { priority, labels } = item;

    if (groupType === 'priority') {
      return <Labels labels={labels} />;
    }

    return (
      <>
        {priority ? (
          <PriorityIndicator isFullBackground={true} value={priority} />
        ) : (
          '-'
        )}
      </>
    );
  };

  checkNull = (statement: boolean, Component: React.ReactNode) => {
    if (statement) {
      return Component;
    }

    return '-';
  };

  render() {
    const styleTr = {
      cursor: 'pointer'
    };

    const { item, onClick, groupType } = this.props;

    const {
      customers,
      companies,
      closeDate,
      isComplete,
      labels,
      assignedUsers
    } = item;

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
          {(groupType === 'assignee' || groupType === 'dueDate') && (
            <td>
              {this.checkNull(
                Boolean(labels.length > 0),
                <Labels labels={labels} />
              )}
            </td>
          )}
          <td>{this.renderPriority()}</td>
          <td>
            {this.checkNull(
              Boolean(closeDate || isComplete),
              <DueDateLabel closeDate={closeDate} isComplete={isComplete} />
            )}
          </td>
          {groupType !== 'assignee' && (
            <td>
              {this.checkNull(
                Boolean(assignedUsers.length > 0),
                <PriceContainer>
                  <Left>
                    <Assignees users={assignedUsers} />
                  </Left>
                </PriceContainer>
              )}
            </td>
          )}
          <td>
            {this.checkNull(
              Boolean(customers && customers.length > 0),
              <Details color="#F7CE53" items={customers || []} />
            )}
          </td>
          <td>
            {this.checkNull(
              Boolean(companies && companies.length > 0),
              <Details color="#EA475D" items={companies || []} />
            )}
          </td>
        </tr>
        {this.renderForm()}
      </>
    );
  }
}

export default ListItemRow;
