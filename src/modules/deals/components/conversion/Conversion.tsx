import MainActionBar from 'modules/boards/containers/MainActionBar';
import { BoardContainer, ScrolledContent } from 'modules/boards/styles/common';

import { __ } from 'modules/common/utils';
import { menuDeal } from 'modules/common/utils/menus';
import Stages from 'modules/deals/containers/conversion/Stages';
import Header from 'modules/layout/components/Header';
import * as React from 'react';
import DealMainActionBar from '../DealMainActionBar';
import { DealContent, FixedContent, ViewDivider } from './style';

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
          <ScrolledContent transparent={true}>
            <FixedContent>
              <Stages
                type="brief"
                pipelineId={pipelineId}
                queryParams={queryParams}
              />

              <ViewDivider />

              <Stages
                type="more"
                pipelineId={pipelineId}
                queryParams={queryParams}
              />
            </FixedContent>
          </ScrolledContent>
        </DealContent>
      </BoardContainer>
    );
  }
}

export default ConversionView;
