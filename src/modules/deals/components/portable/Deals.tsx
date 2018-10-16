import { EmptyState, Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { IDeal, IDealParams } from 'modules/deals/types';
import { Sidebar } from 'modules/layout/components';
import { SectionContainer } from 'modules/layout/styles';
import * as React from 'react';
import { AddDeal, Deal } from '.';

type Props = {
  deals: IDeal[];
  customerId?: string;
  companyId?: string;
  saveDeal: (doc: IDealParams, callback: () => void, deal?: IDeal) => void;
  onChangeDeals: () => void;
  isOpen?: boolean;
};

class PortableDeals extends React.Component<Props> {
  renderDeals = () => {
    const { onChangeDeals, deals } = this.props;

    if (deals.length === 0) {
      return <EmptyState icon="piggy-bank" text="No deal" />;
    }

    return deals.map((deal, index) => (
      <Deal
        key={index}
        deal={deal}
        onAdd={onChangeDeals}
        onUpdate={onChangeDeals}
        onRemove={onChangeDeals}
      />
    ));
  };

  render() {
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Section;

    const { saveDeal, customerId, companyId, isOpen } = this.props;

    const trigger = (
      <a>
        <Icon icon="add" />
      </a>
    );

    const quickButtons = (
      <ModalTrigger
        title="Add a deal"
        trigger={trigger}
        content={props => (
          <AddDeal
            {...props}
            saveDeal={saveDeal}
            customerId={customerId}
            companyId={companyId}
            showSelect={true}
          />
        )}
      />
    );

    return (
      <Section>
        <Title>{__('Deals')}</Title>

        <QuickButtons isSidebarOpen={isOpen}>{quickButtons}</QuickButtons>

        <SectionContainer>{this.renderDeals()}</SectionContainer>
      </Section>
    );
  }
}

export default PortableDeals;
