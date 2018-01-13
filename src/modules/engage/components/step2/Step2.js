import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step,
  Header,
  HeaderNumber,
  Content,
  FinishedStep,
  Flex100,
  ContentCenter,
  Divider
} from './Style';
import Segments from '../Segments';
import { EmptyState } from 'modules/common/components';

const propTypes = {
  finished: PropTypes.bool,
  segments: PropTypes.array,
  message: PropTypes.object,
  onChangeSegments: PropTypes.func,
  counts: PropTypes.object,
  changeStep: PropTypes.func
};

class Step2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      method: 'create'
    };
  }

  emptyText() {
    let text = '0 segment';
    if (this.context.chosenSegment !== '') {
      text = `${this.props.counts[this.context.chosenSegment]} segments`;
    }
    return text;
  }

  render() {
    if (this.props.finished !== false) {
      return (
        <Step>
          <Header>
            <HeaderNumber>2</HeaderNumber>
            <span>Choose segments</span>
          </Header>
          <Content>
            <Flex100>
              <Segments
                segments={this.props.segments}
                defaultSegment={this.props.message.segmentId}
                onChangeSegments={this.props.onChangeSegments}
                counts={this.props.counts}
              />
            </Flex100>
            <Divider />
            <ContentCenter>
              <EmptyState
                text={this.emptyText()}
                size="full"
                position="static"
                icon="pie-graph"
              />
            </ContentCenter>
          </Content>
        </Step>
      );
    }
    return (
      <FinishedStep onClick={() => this.props.changeStep(2)}>
        <Header>
          <HeaderNumber>2</HeaderNumber>
        </Header>
      </FinishedStep>
    );
  }
}

Step2.contextTypes = {
  chosenSegment: PropTypes.string
};

Step2.propTypes = propTypes;

export default Step2;
