import dayjs from 'dayjs';
import Details from 'modules/boards/components/portable/Details';
import UserCounter from 'modules/boards/components/portable/UserCounter';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemContainer, ItemDate } from 'modules/boards/styles/common';
import {
  Footer,
  PriceContainer,
  Right,
  SpaceContent
} from 'modules/boards/styles/item';
import { Content } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import React from 'react';
import { ITask } from '../types';

type Props = {
  item: ITask;
  onAdd?: (stageId: string, item: ITask) => void;
  onRemove?: (dealId: string, stageId: string) => void;
  onUpdate?: (item: ITask) => void;
  options: IOptions;
};

class Task extends React.Component<Props, { isPopupVisible: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      isPopupVisible: false
    };
  }

  renderForm = () => {
    const { item, onAdd, onRemove, onUpdate, options } = this.props;

    return (
      <EditForm
        {...this.props}
        options={options}
        stageId={item.stageId}
        itemId={item._id}
        onAdd={onAdd}
        onRemove={onRemove}
        onUpdate={onUpdate}
      />
    );
  };

  renderDate = (date, format = 'YYYY-MM-DD') => {
    if (!date) {
      return null;
    }

    return (
      <Tip text={dayjs(date).format(format)}>
        <ItemDate>{dayjs(date).format('lll')}</ItemDate>
      </Tip>
    );
  };

  render() {
    const { item } = this.props;

    const onClick = () => {
      this.setState({ isPopupVisible: true });
    };

    return (
      <>
        <ItemContainer onClick={onClick}>
          <Content>
            <SpaceContent>
              <h5>{item.name}</h5>
              {this.renderDate(item.closeDate)}
            </SpaceContent>
            <Details color="#F7CE53" items={item.customers || []} />
            <Details color="#EA475D" items={item.companies || []} />
          </Content>
          <PriceContainer>
            <Right>
              <UserCounter users={item.assignedUsers || []} />
            </Right>
          </PriceContainer>

          <Footer>
            {__('Last updated')}:
            <Right>{this.renderDate(item.modifiedAt)}</Right>
          </Footer>
        </ItemContainer>
        {this.renderForm()}
      </>
    );
  }
}

export default Task;
