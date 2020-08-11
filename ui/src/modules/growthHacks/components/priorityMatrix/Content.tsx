import Left from 'modules/growthHacks/components/priorityMatrix/Left';
import EditableGrowthHackList from 'modules/growthHacks/containers/EditableGrowthHackList';
import { ContentContainer } from 'modules/growthHacks/styles';
import React from 'react';
import Chart from './Chart';

type Props = {
  queryParams: any;
  datas: any[];
  priorityMatrixRefetch: () => void;
};

class Content extends React.Component<Props> {
  render() {
    const { datas, priorityMatrixRefetch, queryParams } = this.props;

    return (
      <ContentContainer>
        <EditableGrowthHackList
          component={Left}
          refetch={priorityMatrixRefetch}
          queryParams={queryParams}
        />
        <Chart datas={datas} />
      </ContentContainer>
    );
  }
}

export default Content;
