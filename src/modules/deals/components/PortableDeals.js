import React from 'react';
import PropTypes from 'prop-types';
import { ModalTrigger, EmptyState, Icon } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import { SectionContainer } from 'modules/layout/styles';
import { Deal } from '../containers';
import { DealAddForm } from './';

const propTypes = {
  deals: PropTypes.array,
  customerId: PropTypes.string,
  companyId: PropTypes.string,
  saveDeal: PropTypes.func,
  removeDeal: PropTypes.func
};

const defaultProps = {
  deals: []
};

class PortableDeals extends React.Component {
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
    const { __ } = this.context;

    const trigger = (
      <a>
        <Icon icon="add" />
      </a>
    );

    const quickButtons = (
      <ModalTrigger title="Add a deal" trigger={trigger}>
        <DealAddForm
          saveDeal={saveDeal}
          customerId={customerId}
          companyId={companyId}
          showSelect
        />
      </ModalTrigger>
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

PortableDeals.propTypes = propTypes;
PortableDeals.contextTypes = {
  __: PropTypes.func
};
PortableDeals.defaultProps = defaultProps;

export default PortableDeals;
