import MainActionBar from '@erxes/ui-cards/src/boards/containers/MainActionBar';
import {
  BoardContainer,
  ScrolledContent
} from '@erxes/ui-cards/src/boards/styles/common';

import { __ } from '@erxes/ui/src/utils/core';
import Stages from '../../containers/conversion/Stages';
import Header from '@erxes/ui/src/layout/components/Header';
import * as React from 'react';
import PurchaseMainActionBar from '../PurchaseMainActionBar';
import { PurchaseContent, FixedContent, ViewDivider } from './style';

type Props = {
  queryParams: any;
};

class ConversionView extends React.Component<Props> {
  render() {
    const { queryParams } = this.props;
    const pipelineId = queryParams.pipelineId;
    const breadcrumb = [{ title: __('Purchase pipeline') }];

    return (
      <BoardContainer>
        <Header title={__('Purchase')} breadcrumb={breadcrumb} />
        <PurchaseContent transparent={true}>
          <MainActionBar type="purchase" component={PurchaseMainActionBar} />
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
        </PurchaseContent>
      </BoardContainer>
    );
  }
}

export default ConversionView;
