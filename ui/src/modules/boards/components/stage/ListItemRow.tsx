import dayjs from 'dayjs';
import Assignees from 'modules/boards/components/Assignees';
import Details from 'modules/boards/components/Details';
import DueDateLabel from 'modules/boards/components/DueDateLabel';
import Labels from 'modules/boards/components/label/Labels';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemDate } from 'modules/boards/styles/common';
import {
  LastUpdate,
  Left,
  PriceContainer,
  ColumnChild,
  LabelColumn,
  StageColumn
} from 'modules/boards/styles/item';
import { IOptions } from 'modules/boards/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import PriorityIndicator from '../editForm/PriorityIndicator';
import { IDeal } from 'modules/deals/types';

type Props = {
  stageId?: string;
  onClick?: () => void;
  item: IDeal;
  isFormVisible?: boolean;
  options: IOptions;
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
        <LabelColumn>
          {this.checkNull(labels.length > 0, <Labels labels={labels} />)}
        </LabelColumn>
      );
    }

    return (
      <StageColumn>
        <span>{stage ? stage.name : '-'}</span>
      </StageColumn>
    );
  };

  renderPriority = () => {
    const { item, groupType } = this.props;
    const { priority, labels } = item;

    if (groupType === 'priority') {
      return (
        <LabelColumn>
          <Labels labels={labels} />
        </LabelColumn>
      );
    }

    return (
      <td>
        {priority ? (
          <PriorityIndicator isFullBackground={true} value={priority} />
        ) : (
          '-'
        )}
      </td>
    );
  };

  checkNull = (statement: boolean, Component: React.ReactNode) => {
    if (statement) {
      return Component;
    }

    return '-';
  };

  render() {
    const { item, onClick, groupType, options } = this.props;

    const {
      customers,
      companies,
      closeDate,
      isComplete,
      labels,
      assignedUsers,
      products
    } = item;

    return (
      <>
        <tr onClick={onClick} key={item._id} style={{ cursor: 'pointer' }}>
          <ColumnChild>
            <h5>{item.name}</h5>
            <LastUpdate>
              {__('Last updated')}: {this.renderDate(item.modifiedAt)}
            </LastUpdate>
          </ColumnChild>
          {this.renderStage()}
          {(groupType === 'assignee' || groupType === 'dueDate') && (
            <LabelColumn>
              {this.checkNull(labels.length > 0, <Labels labels={labels} />)}
            </LabelColumn>
          )}
          {this.renderPriority()}
          <td>
            {this.checkNull(
              Boolean(closeDate || isComplete),
              <DueDateLabel closeDate={closeDate} isComplete={isComplete} />
            )}
          </td>
          {groupType !== 'assignee' && (
            <td>
              {this.checkNull(
                assignedUsers.length > 0,
                <PriceContainer>
                  <Left>
                    <Assignees users={assignedUsers} />
                  </Left>
                </PriceContainer>
              )}
            </td>
          )}
          {options.type === 'deal' && (
            <td>
              {this.checkNull(
                products > 0,
                <Details color="#63D2D6" items={products || []} />
              )}
            </td>
          )}
          <td>
            {this.checkNull(
              customers.length > 0,
              <Details color="#F7CE53" items={customers || []} />
            )}
          </td>
          <ColumnChild>
            {this.checkNull(
              companies.length > 0,
              <Details color="#EA475D" items={companies || []} />
            )}
          </ColumnChild>
        </tr>
        {this.renderForm()}
      </>
    );
  }
}

export default ListItemRow;
