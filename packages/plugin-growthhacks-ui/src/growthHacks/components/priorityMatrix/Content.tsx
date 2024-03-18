import Left from './Left';
import EditableGrowthHackList from '../../containers/EditableGrowthHackList';
import { ContentContainer } from '../../styles';
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
