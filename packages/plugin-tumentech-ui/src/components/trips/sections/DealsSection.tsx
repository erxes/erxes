import { Sidebar, CollapseContent } from '@erxes/ui/src';
import React from 'react';
import { IDeal } from '@erxes/ui-cards/src/deals/types';
import DealInfo from './DealInfo';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  deals: IDeal[];
};

class DealsSection extends React.Component<Props> {
  render() {
    const { Section } = Sidebar;
    const { deals } = this.props;

    return (
      <Sidebar.Section>
        <CollapseContent
          title={`${__('Deals')} (${deals.length})`}
          compact={true}
          open={deals.length >= 2}
        >
          <Section>
            {deals.map(deal => (
              <DealInfo deal={deal} />
            ))}
          </Section>
        </CollapseContent>

        {/* {this.renderAction()} */}
      </Sidebar.Section>
    );
  }
}

export default DealsSection;
