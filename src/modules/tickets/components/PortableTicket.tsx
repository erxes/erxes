import { DetailItems, UserCounter } from 'modules/boards/components/portable';
import { EditForm } from 'modules/boards/containers/editForm';
import { ItemContainer } from 'modules/boards/styles';
import { renderDate } from 'modules/boards/utils';
import { ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import {
  Footer,
  PriceContainer,
  Right,
  SpaceContent
} from 'modules/deals/styles/deal';
import { Content } from 'modules/deals/styles/stage';
import * as React from 'react';
import { ITicket } from '../types';

type Props = {
  item: ITicket;
  onAdd?: (stageId: string, item: ITicket) => void;
  onRemove?: (dealId: string, stageId: string) => void;
  onUpdate?: (item: ITicket) => void;
};

class Ticket extends React.Component<Props, { isFormVisible: boolean }> {
  renderFormTrigger = (trigger: React.ReactNode) => {
    const { item, onAdd, onRemove, onUpdate } = this.props;

    const content = props => (
      <EditForm
        {...props}
        type="ticket"
        stageId={item.stageId}
        itemId={item._id}
        onAdd={onAdd}
        onRemove={onRemove}
        onUpdate={onUpdate}
      />
    );

    return (
      <ModalTrigger
        title="Edit ticket"
        trigger={trigger}
        size="lg"
        content={content}
      />
    );
  };

  render() {
    const { item } = this.props;

    const content = (
      <ItemContainer>
        <Content>
          <SpaceContent>
            <h5>{item.name}</h5>
            {renderDate(item.closeDate)}
          </SpaceContent>
          <DetailItems color="#F7CE53" items={item.customers || []} />
          <DetailItems color="#EA475D" items={item.companies || []} />
        </Content>
        <PriceContainer>
          <Right>
            <UserCounter users={item.assignedUsers || []} />
          </Right>
        </PriceContainer>

        <Footer>
          {__('Last updated')}:<Right>{renderDate(item.modifiedAt)}</Right>
        </Footer>
      </ItemContainer>
    );

    return this.renderFormTrigger(content);
  }
}

export default Ticket;
