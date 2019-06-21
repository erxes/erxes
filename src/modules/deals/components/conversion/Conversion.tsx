import { FlexItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { menuDeal } from 'modules/common/utils/menus';
import { Header } from 'modules/layout/components';
import * as React from 'react';
import styled from 'styled-components';
import { MainActionBar, StageList } from '../../containers';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from '../../styles/common';

type Props = {
  queryParams: any;
};

const Content = styled.div`
  flex: 1;
  overflow: hidden;
  background: #e5e8ec;
  margin: 0 5px;
  min-width: 280px;
  border-radius: 3px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 1px 5px 0px;
`;

class ConversionView extends React.Component<Props> {
  renderActionBar() {
    return <MainActionBar />;
  }

  render() {
    return (
      <BoardContainer>
        <Header title={__('Deal')} submenu={menuDeal} />
        <BoardContent transparent={true}>
          {this.renderActionBar()}
          <ScrolledContent transparent={true}>
            <FlexItem>
              <FlexItem direction="column">
                <Content>
                  <StageList
                    type="brief"
                    pipelineId={this.props.queryParams.pipelineId}
                    queryParams={this.props.queryParams}
                  />
                </Content>
              </FlexItem>

              <FlexItem direction="column">
                <Content>
                  <StageList
                    type="more"
                    pipelineId={this.props.queryParams.pipelineId}
                    queryParams={this.props.queryParams}
                  />
                </Content>
              </FlexItem>
            </FlexItem>
          </ScrolledContent>
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default ConversionView;
