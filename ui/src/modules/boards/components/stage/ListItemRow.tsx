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
  index: number;
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

  render() {
    const { item, onClick } = this.props;
    const { customers, companies, closeDate, isComplete, priority } = item;

    return (
      <>
        <tr onClick={onClick} key={item._id}>
          <td>
            <h5>{item.name}</h5>
            <LastUpdate>
              {__('Last updated')}: {this.renderDate(item.modifiedAt)}
            </LastUpdate>
          </td>
          <td>
            {item.labels.length > 0 ? <Labels labels={item.labels} /> : '-'}
          </td>
          <td>
            {priority ? (
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
          <td>
            {item.assignedUsers.length > 0 ? (
              <PriceContainer>
                <Left>
                  <Assignees users={item.assignedUsers} />
                </Left>
              </PriceContainer>
            ) : (
              '-'
            )}
          </td>
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
