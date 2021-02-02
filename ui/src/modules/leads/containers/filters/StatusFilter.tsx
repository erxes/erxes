import StatusFilter from 'modules/leads/components/StatusFilter';
import React from 'react';
import { withProps } from '../../../common/utils';
import { Counts } from '../../types';

type Props = {
  counts: Counts;
}

type FinalProps = {} & Props;

class StatusFilterContainer extends React.Component<FinalProps> {
  render() {
    
    return (
      <StatusFilter
        counts={this.props.counts || {}}
      />
    );
  }

}

export default withProps<Props>(
  (StatusFilterContainer)
);
