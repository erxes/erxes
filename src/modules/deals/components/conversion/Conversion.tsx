import { MainActionBar } from 'modules/boards/containers';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from 'modules/boards/styles/common';
import { FlexItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { menuDeal } from 'modules/common/utils/menus';
import DealStages from 'modules/deals/containers/conversion/DealStages';
import { Header } from 'modules/layout/components';
import * as React from 'react';
import { DealMainActionBar } from '../';
import { DealContent } from './style';

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
        <DealContent transparent={true}>
          <MainActionBar type="deal" component={DealMainActionBar} />
          <BoardContent>
            <ScrolledContent transparent={true}>
              <FlexItem>
                <FlexItem direction="column">
                  <DealStages
                    type="brief"
                    pipelineId={pipelineId}
                    queryParams={queryParams}
                  />
                </FlexItem>

                <FlexItem direction="column">
                  <DealStages
                    type="more"
                    pipelineId={pipelineId}
                    queryParams={queryParams}
                  />
                </FlexItem>
              </FlexItem>
            </ScrolledContent>
          </BoardContent>
        </DealContent>
      </BoardContainer>
    );
  }
}

export default ConversionView;
