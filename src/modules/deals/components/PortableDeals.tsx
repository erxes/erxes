import { EmptyState, Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { SectionContainer } from 'modules/layout/styles';
import * as React from 'react';
import { Deal } from '../containers';
import { IDeal, IDealParams } from '../types';
import PortableAddDeal from './PortableAddDeal';

type Props = {
  deals: IDeal[];
  customerId?: string;
  companyId?: string;
  saveDeal: (doc: IDealParams, callback: () => void, deal?: IDeal) => void;
  removeDeal: (_id: string, callback: () => void) => void;
};

class PortableDeals extends React.Component<Props> {
  renderDeals() {
    const { saveDeal, removeDeal, deals } = this.props;

    if (deals.length === 0) {
      return <EmptyState icon="piggy-bank" text="No deal" />;
    }

    return deals.map((deal, index) => (
      <Deal
        key={index}
        dealId={deal._id}
        saveDeal={saveDeal}
        removeDeal={removeDeal}
      />
    ));
  }

  render() {
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Section;

    const { saveDeal, customerId, companyId } = this.props;

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
          <PortableAddDeal
            {...props}
            saveDeal={saveDeal}
            customerId={customerId}
            companyId={companyId}
            showSelect
          />
        )}
      />
    );

    return (
      <Section>
        <Title>{__('Deals')}</Title>

        <QuickButtons>{quickButtons}</QuickButtons>

        <SectionContainer>{this.renderDeals()}</SectionContainer>
      </Section>
    );
  }
}

export default PortableDeals;
