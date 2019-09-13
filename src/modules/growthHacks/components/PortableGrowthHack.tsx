import dayjs from 'dayjs';
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
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IGrowthHack } from '../types';

type Props = {
  item: IGrowthHack;
  onAdd?: (stageId: string, item: IGrowthHack) => void;
  onRemove?: (dealId: string, stageId: string) => void;
  onUpdate?: (item: IGrowthHack) => void;
  options: IOptions;
};

class GrowthHack extends React.Component<Props, { isFormVisible: boolean }> {
  renderFormTrigger = (trigger: React.ReactNode) => {
    const { item, onAdd, onRemove, onUpdate, options } = this.props;

    const content = props => (
      <EditForm
        {...props}
        options={options}
        stageId={item.stageId}
        itemId={item._id}
        onAdd={onAdd}
        onRemove={onRemove}
        onUpdate={onUpdate}
      />
    );

    return (
      <ModalTrigger
        title="Edit growth hack"
        trigger={trigger}
        size="lg"
        content={content}
        hideHeader={true}
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

    const content = (
      <ItemContainer>
        <Content>
          <SpaceContent>
            <h5>{item.name}</h5>
            {this.renderDate(item.closeDate)}
          </SpaceContent>
        </Content>
        <PriceContainer>
          <Right>
            <UserCounter users={item.assignedUsers || []} />
          </Right>
        </PriceContainer>

        <Footer>
          {__('Last updated')}:<Right>{this.renderDate(item.modifiedAt)}</Right>
        </Footer>
      </ItemContainer>
    );

    return this.renderFormTrigger(content);
  }
}

export default GrowthHack;
