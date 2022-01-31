import { IConversionStage } from 'modules/boards/types';
import { __ } from 'modules/common/utils';
import Stage from 'modules/deals/containers/conversion/Stage';
import * as React from 'react';
import { HeadRow, TableView } from '../style';

type Props = {
  stages: IConversionStage[];
  pipelineId: string;
  queryParams: any;
};

class Table extends React.Component<Props, {}> {
  render() {
    const { stages, queryParams, pipelineId } = this.props;

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
            queryParams={queryParams}
            pipelineId={pipelineId}
          />
        ))}
      </TableView>
    );
  }
}

export default Table;
