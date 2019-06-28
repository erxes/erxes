import { EmptyState, Table } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import Stage from '../../../containers/conversion/stageInfoMore/Stage';
import { IStage } from '../../../types';
import { Container, ContentBody, Result } from '../style';

type Props = {
  stages: IStage[];
  pipelineId: string;
  queryParams: any;
};

class StageList extends React.Component<Props, {}> {
  renderContent() {
    const { stages, queryParams, pipelineId } = this.props;
    if (stages.length === 0) {
      return <EmptyState icon="piggy-bank" text="No deal" />;
    }

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Stage')}</th>
            <th>{__('Stayed')}</th>
            <th>{__('In progress')}</th>
            <th>{__('Lost')}</th>
          </tr>
        </thead>
        <tbody>
          {stages.map(stage => (
            <Stage
              key={stage._id}
              stage={stage}
              deals={stage.deals || []}
              queryParams={queryParams}
              pipelineId={pipelineId}
            />
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    return <Container>{this.renderContent()}</Container>;
  }
}

export default StageList;
