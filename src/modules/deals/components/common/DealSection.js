import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { EmptyState } from 'modules/common/components';
import { DealSectionContainer, DealContainer } from '../../styles';
import { CommonDeal } from '../';

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

        <DealSectionContainer>
          {deals.map((deal, index) => (
            <DealContainer key={index}>
              <CommonDeal deal={deal} />
            </DealContainer>
          ))}

          {deals.length === 0 && <EmptyState icon="briefcase" text="No deal" />}
        </DealSectionContainer>
      </Section>
    );
  }
}

DealSection.propTypes = propTypes;
DealSection.contextTypes = {
  __: PropTypes.func
};

export default DealSection;
