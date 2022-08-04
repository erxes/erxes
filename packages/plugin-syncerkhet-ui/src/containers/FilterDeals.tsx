import { Bulk } from '@erxes/ui/src/components';
import React from 'react';
import FilterDeal from '../components/FilterDeal';
type Props = {
  checkedDealIds: any;
  dealsIds: any;
  boardId: any;
  pipelineId: any;
  stageId: any;
  loading: boolean;
};

class FilterDealsContainer extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const content = props => <FilterDeal {...props} />;

    const refetch = () => {
      this.props.checkedDealIds.refetch();
    };

    return <Bulk content={content} refetch={refetch} />;
  }
}

export default FilterDealsContainer;
