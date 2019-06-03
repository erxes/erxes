import { DetailItems, UserCounter } from 'modules/boards/components/portable';
import { EditForm } from 'modules/boards/containers/editForm';
import { renderAmount } from 'modules/boards/utils';
import { renderDate } from 'modules/boards/utils';
import { ModalTrigger } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import { Content } from 'modules/deals/styles/stage';
import * as React from 'react';
import {
  Deal as DealContainer,
  Footer,
  PriceContainer,
  Right,
  SpaceContent,
  Status
} from '../styles/deal';
import { IDeal } from '../types';

type Props = {
  deal: IDeal;
  onAdd?: (stageId: string, deal: IDeal) => void;
  onRemove?: (dealId: string, stageId: string) => void;
  onUpdate?: (deal: IDeal) => void;
};

class Deal extends React.Component<Props, { isFormVisible: boolean }> {
  renderFormTrigger = (trigger: React.ReactNode) => {
    const { deal, onAdd, onRemove, onUpdate } = this.props;

    const content = props => (
      <EditForm
        {...props}
        stageId={deal.stageId}
        dealId={deal._id}
        onAdd={onAdd}
        onRemove={onRemove}
        onUpdate={onUpdate}
      />
    );

    return (
      <ModalTrigger
        title="Edit deal"
        trigger={trigger}
        size="lg"
        content={content}
      />
    );
  };

  renderStatusLabel(text, color) {
    return (
      <Status>
        <span style={{ backgroundColor: color }}>{__(text)}</span>
      </Status>
    );
  }

  renderDealStatus(stage) {
    if (!stage) {
      return null;
    }

    if (stage.probability === 'Lost') {
      return this.renderStatusLabel('Lost', colors.colorCoreRed);
    }

    if (stage.probability === 'Won') {
      return this.renderStatusLabel('Won', colors.colorCoreGreen);
    }

    return this.renderStatusLabel('In Progress', colors.colorCoreBlue);
  }

  render() {
    const { deal } = this.props;
    const products = (deal.products || []).map(p => p.product);

    const content = (
      <DealContainer>
        {this.renderDealStatus(deal.stage)}
        <Content>
          <SpaceContent>
            <h5>{deal.name}</h5>
            {renderDate(deal.closeDate)}
          </SpaceContent>
          <DetailItems color="#63D2D6" items={products} />
          <DetailItems color="#F7CE53" items={deal.customers || []} />
          <DetailItems color="#EA475D" items={deal.companies || []} />
        </Content>
        <PriceContainer>
          {renderAmount(deal.amount)}

          <Right>
            <UserCounter users={deal.assignedUsers || []} />
          </Right>
        </PriceContainer>

        <Footer>
          {__('Last updated')}:<Right>{renderDate(deal.modifiedAt)}</Right>
        </Footer>
      </DealContainer>
    );

    return this.renderFormTrigger(content);
  }
}

export default Deal;
