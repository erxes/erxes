import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { ModalTrigger, EmptyState, Icon } from 'modules/common/components';
import { DealAddForm } from '../';
import { CommonDeal } from '../../containers';
import { SectionContainer, Container } from '../../styles/deal';

const propTypes = {
  deals: PropTypes.array.isRequired,
  saveDeal: PropTypes.func
};

class DealSection extends React.Component {
  render() {
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Sidebar.Section;
    const { saveDeal, deals } = this.props;
    const { __ } = this.context;

    return (
      <Section>
        <Title>{__('Deals')}</Title>

        <QuickButtons>
          <ModalTrigger
            title="Associate"
            size="lg"
            trigger={<Icon icon="plus" />}
          >
            <DealAddForm saveDeal={saveDeal} />
          </ModalTrigger>
        </QuickButtons>

        <SectionContainer>
          {deals.map((deal, index) => (
            <Container key={index}>
              <CommonDeal dealId={deal._id} saveDeal={saveDeal} />
            </Container>
          ))}

          {deals.length === 0 && <EmptyState icon="briefcase" text="No deal" />}
        </SectionContainer>
      </Section>
    );
  }
}

DealSection.propTypes = propTypes;
DealSection.contextTypes = {
  __: PropTypes.func
};

export default DealSection;
