import { colors } from 'modules/common/styles';
import * as React from 'react';
import { Items, UserCounter } from '.';
import {
  ActionInfo,
  Container,
  FooterContent,
  ItemList,
  SpaceContent,
  Status
} from '../../styles/deal';

import { ModalTrigger } from 'modules/common/components';
import { EditForm } from 'modules/deals/containers/editForm';
import { renderDealAmount, renderDealDate } from 'modules/deals/utils';
import { __ } from '../../../common/utils';
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
      <Container>
        {this.renderDealStatus(deal.stage)}
        <SpaceContent>
          <h4>{deal.name}</h4>
          {renderDealDate(deal.closeDate)}
        </SpaceContent>
        <SpaceContent>
          <FooterContent>
            <ItemList>
              <Items color="#63D2D6" items={products} />
            </ItemList>
            <ItemList>
              <Items color="#F7CE53" items={deal.customers || []} />
              <Items
                color="#F7CE53"
                uppercase={true}
                items={deal.companies || []}
              />
            </ItemList>
            {renderDealAmount(deal.amount || {})}
          </FooterContent>
          <UserCounter users={deal.assignedUsers || []} />
        </SpaceContent>
        <ActionInfo>
          <span>{__('Last updated')}:</span>
          {renderDealDate(deal.modifiedAt, 'lll')}
        </ActionInfo>
      </Container>
    );

    return this.renderFormTrigger(content);
  }
}

export default Deal;
