import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';
import { IDeal } from 'modules/deals/types';
import * as React from 'react';
import { CenterButton, Deals, SubHead } from '../style';
import DealItem from './DealItem';

type Props = {
  listId: string;
  listType?: string;
  stageId: string;
  deals: IDeal[];
  hasMore: boolean;
  loadMore: () => void;
};

export default class DealList extends React.Component<Props> {
  static defaultProps = {
    listId: 'LIST'
  };

  render() {
    const { deals } = this.props;
    const contents = deals.map((deal, index) => (
      <DealItem key={index} deal={deal} />
    ));

    return (
      <Deals>
        <SubHead>
          <span>{__('Deal')}</span>
          <span>{__('Value')}</span>
          <span>{__('Current Stage')}</span>
          <span>{__('Assigned')}</span>
        </SubHead>
        {contents}
        {this.props.hasMore && (
          <CenterButton>
            <Button
              size="small"
              btnStyle="success"
              icon="refresh"
              onClick={this.props.loadMore}
            >
              Load More
            </Button>
          </CenterButton>
        )}
      </Deals>
    );
  }
}
