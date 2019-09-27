import MainActionBar from 'modules/boards/containers/MainActionBar';
import { BoardContainer } from 'modules/boards/styles/common';
import { __ } from 'modules/common/utils';
import { HACKSTAGES } from 'modules/growthHacks/constants';
import { FixedContainer, ScrollContent } from 'modules/growthHacks/styles';
import Header from 'modules/layout/components/Header';
import { MainContent } from 'modules/layout/styles';
import React from 'react';
import GrowthHackMainActionBar from '../GrowthHackMainActionBar';
import FunnelGroup from './FunnelGroup';

type Props = {
  queryParams: any;
};

class FunnelImpact extends React.Component<Props> {
  renderContent = () => {
    const queryParams = this.props.queryParams;

    return (
      <FixedContainer>
        <ScrollContent>
          {HACKSTAGES.map(gh => (
            <FunnelGroup key={gh} queryParams={queryParams} hackStage={gh} />
          ))}
        </ScrollContent>
      </FixedContainer>
    );
  };

  renderActionBar = () => (
    <MainActionBar type="growthHack" component={GrowthHackMainActionBar} />
  );

  render() {
    const breadcrumb = [{ title: __('Growth hack') }];

    return (
      <BoardContainer>
        <Header title={__('Growth hack')} breadcrumb={breadcrumb} />
        <MainContent transparent={true} style={{ margin: 0 }}>
          {this.renderActionBar()}
          {this.renderContent()}
        </MainContent>
      </BoardContainer>
    );
  }
}

export default FunnelImpact;
