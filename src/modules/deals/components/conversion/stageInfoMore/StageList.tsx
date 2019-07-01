import { EmptyState } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import Stage from '../../../containers/conversion/stageInfoMore/Stage';
import { IStage } from '../../../types';
import { Container, ContentBody, HeadRow, TableView } from '../style';

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
      <TableView>
        <HeadRow>
          <span>{__('Stage')}</span>
          <span>{__('Stayed')}</span>
          <span>{__('In progress')}</span>
          <span>{__('Lost')}</span>
        </HeadRow>
        {stages.map(stage => (
          <Stage
            key={stage._id}
            stage={stage}
            deals={stage.deals || []}
            queryParams={queryParams}
            pipelineId={pipelineId}
          />
        ))}
      </TableView>
    );
  }

  render() {
    return (
      <Container>
        <ContentBody>{this.renderContent()}</ContentBody>
      </Container>
    );
  }
}

export default StageList;
