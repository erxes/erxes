import { FlexItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { menuDeal } from 'modules/common/utils/menus';
import { Header } from 'modules/layout/components';
import { MainContent } from 'modules/layout/styles';
import * as React from 'react';
import { MainActionBar, StageList } from '../../containers';
import { BoardContainer, ScrolledContent } from '../../styles/common';

type Props = {
  queryParams: any;
};

class ConversionView extends React.Component<Props> {
  render() {
    const { queryParams } = this.props;
    const pipelineId = queryParams.pipelineId;

    return (
      <BoardContainer>
        <Header title={__('Deal')} submenu={menuDeal} />
        <MainContent transparent={true}>
          <MainActionBar />
          <ScrolledContent transparent={true}>
            <FlexItem>
              <FlexItem direction="column">
                <StageList
                  type="brief"
                  pipelineId={pipelineId}
                  queryParams={queryParams}
                />
              </FlexItem>

              <FlexItem direction="column">
                <StageList
                  type="more"
                  pipelineId={pipelineId}
                  queryParams={queryParams}
                />
              </FlexItem>
            </FlexItem>
          </ScrolledContent>
        </MainContent>
      </BoardContainer>
    );
  }
}

export default ConversionView;
