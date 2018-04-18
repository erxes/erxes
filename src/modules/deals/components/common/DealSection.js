import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { EmptyState } from 'modules/common/components';
import { CommonDeal } from '../';
import { SectionContainer, Container } from '../../styles/deal';

const propTypes = {
  deals: PropTypes.array.isRequired
};

class DealSection extends React.Component {
  render() {
    const { Section } = Sidebar;
    const { Title } = Sidebar.Section;
    const { deals } = this.props;
    const { __ } = this.context;

    return (
      <Section>
        <Title>{__('Deals')}</Title>

        <SectionContainer>
          {deals.map((deal, index) => (
            <Container key={index}>
              <CommonDeal deal={deal} />
            </Container>
          ))}

          {deals.length === 0 && (
            <EmptyState icon="piggy-bank" text="No deal" />
          )}
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
