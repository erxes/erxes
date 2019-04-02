import { ModalTrigger } from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { EditForm } from 'modules/deals/containers/editForm';
import { Content } from 'modules/deals/styles/stage';
import { renderDealAmount, renderDealDate } from 'modules/deals/utils';
import * as React from 'react';
import { Items, UserCounter } from '.';
import { __ } from '../../../common/utils';
import {
  Deal as DealContainer,
  Footer,
  PriceContainer,
  Right,
  SpaceContent,
  Status
} from '../../styles/deal';
import { IDeal } from '../../types';

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
            {renderDealDate(deal.closeDate)}
          </SpaceContent>
          <Items color="#63D2D6" items={products} />
          <Items color="#F7CE53" items={deal.customers || []} />
          <Items color="#EA475D" items={deal.companies || []} />
        </Content>
        <PriceContainer>
          {renderDealAmount(deal.amount)}

          <Right>
            <UserCounter users={deal.assignedUsers || []} />
          </Right>
        </PriceContainer>

        <Footer>
          {__('Last updated')}:<Right>{renderDealDate(deal.modifiedAt)}</Right>
        </Footer>
      </DealContainer>
    );

    return this.renderFormTrigger(content);
  }
}

export default Deal;
