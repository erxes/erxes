import GrowthHacksContainer from 'modules/growthHacks/containers/GrowthHacksContainer';
import { FunnelContent, Title } from 'modules/growthHacks/styles';
import React from 'react';

type Props = {
  queryParams: any;
  hackStage: string;
};
class FunnelGroup extends React.Component<Props> {
  render() {
    return (
      <FunnelContent>
        <Title>{this.props.hackStage}</Title>

        <GrowthHacksContainer
          hackStage={this.props.hackStage}
          queryParams={this.props.queryParams}
        />
      </FunnelContent>
    );
  }
}

export default FunnelGroup;
