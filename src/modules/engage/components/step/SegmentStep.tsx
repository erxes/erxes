import { FormControl, Icon } from 'modules/common/components';
import { FlexItem } from 'modules/common/components/step/styles';
import { colors, dimensions } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import { ISegment, ISegmentCondition, ISegmentField } from 'modules/segments/types';
import React, { Component } from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { Segments, SegmentsForm } from '..';

const RadioContainer = styled.div`
  border-bottom: 1px dotted ${colors.borderPrimary};

  > * {
    padding: ${dimensions.coreSpacing}px;
  }
`;

const SegmentContainer = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const CustomerCounts = styled.div`
  text-align: center;

  > i {
    color: ${colors.colorCoreLightGray};
  }
`;

const Show = styledTS<{ show: boolean }>(styled.div)`
  display: ${props => (props.show ? 'block' : 'none')};
`;

type Doc = {
  name: string; 
  description: string; 
  subOf: string;  
  color: string; 
  connector: string;  
  conditions: ISegmentCondition[];
}

type Props = {
  changeSegment: (name: string, value: string) => void;
  segments: ISegment[];
  headSegments: ISegment[];
  segmentFields: ISegmentField[];
  segmentAdd: (params: { doc: Doc}) => void;
  counts: any;
  count: (segment: Doc) => void;
  segment: string;
};

type State = {
  segment: string;
  createSegment: boolean;
}

class SegmentStep extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      segment: props.segment || '',
      createSegment: false
    };

    this.changeSegment = this.changeSegment.bind(this);
    this.createSegment = this.createSegment.bind(this);
  }

  createSegment(createSegment) {
    this.setState({ createSegment });

    if (createSegment === true) {
      this.changeSegment('');
    }
  }

  changeSegment(segment) {
    this.setState({ segment });
    this.props.changeSegment('segment', segment);
  }

  renderSegments(show) {
    if (!show) {
      return (
        <SegmentContainer>
          <Segments
            segments={this.props.segments}
            changeSegments={this.changeSegment}
            counts={this.props.counts}
            defaultValue={this.state.segment}
          />
        </SegmentContainer>
      );
    }

    return null;
  }

  render() {
    const show = this.state.createSegment;

    return (
      <FlexItem>
        <FlexItem direction="column" overflow="auto">
          <RadioContainer>
            <FormControl
              componentClass="radio"
              onChange={() => this.createSegment(false)}
              name="createSegment"
              value={false}
              checked={this.state.createSegment === false}
            >
              {__('Choose segment')}
            </FormControl>

            <FormControl
              componentClass="radio"
              onChange={() => this.createSegment(true)}
              name="createSegment"
              checked={this.state.createSegment === true}
              value={true}
            >
              {__('Create segment')}
            </FormControl>
          </RadioContainer>

          {this.renderSegments(show)}

          <Show show={show}>
            <SegmentsForm
              fields={this.props.segmentFields}
              create={this.props.segmentAdd}
              headSegments={this.props.headSegments}
              count={this.props.count}
              createSegment={this.createSegment}
            />
          </Show>
        </FlexItem>

        <FlexItem direction="column" v="center" h="center">
          <CustomerCounts>
            <Icon icon="users" size={50} />
            <p>
              {this.props.counts[this.state.segment] || 0} {__('customers')}
            </p>
          </CustomerCounts>
        </FlexItem>
      </FlexItem>
    );
  }
}

export default SegmentStep;
