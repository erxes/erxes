import MainActionBar from '@erxes/ui-cards/src/boards/containers/MainActionBar';
import {
  BoardContainer,
  ScrolledContent
} from '@erxes/ui-cards/src/boards/styles/common';

import { __ } from '@erxes/ui/src/utils/core';
import { menuDeal } from '@erxes/ui/src/utils/menus';
import Stages from '../../containers/conversion/Stages';
import Header from '@erxes/ui/src/layout/components/Header';
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
          <ScrolledContent>
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
