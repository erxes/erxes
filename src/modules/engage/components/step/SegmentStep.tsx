import { FormControl, Icon } from 'modules/common/components';
import { FlexItem } from 'modules/common/components/step/styles';
import { colors, dimensions } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import { ISegment, ISegmentDoc, ISegmentField } from 'modules/segments/types';
import * as React from 'react';
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

type Props = {
  onChange: (name: 'segmentId', value: string) => void;
  segments: ISegment[];
  headSegments: ISegment[];
  segmentFields: ISegmentField[];
  segmentAdd: (params: { doc: ISegmentDoc }) => void;
  counts: any;
  count: (segment: ISegmentDoc) => void;
  segmentId: string;
};

type State = {
  segmentId: string;
  createSegment: boolean;
};

class SegmentStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      segmentId: props.segmentId || '',
      createSegment: false
    };
  }

  createSegment = createSegment => {
    this.setState({ createSegment });

    if (createSegment === true) {
      this.changeSegment('');
    }
  };

  changeSegment = segmentId => {
    this.setState({ segmentId });
    this.props.onChange('segmentId', segmentId);
  };

  renderSegments(show) {
    if (!show) {
      return (
        <SegmentContainer>
          <Segments
            segments={this.props.segments}
            changeSegments={this.changeSegment}
            counts={this.props.counts}
            defaultValue={this.state.segmentId}
          />
        </SegmentContainer>
      );
    }

    return null;
  }

  render() {
    const show = this.state.createSegment;
    const onChange = () => this.createSegment(false);
    const onChangeSegment = () => this.createSegment(true);

    return (
      <FlexItem>
        <FlexItem direction="column" overflow="auto">
          <RadioContainer>
            <FormControl
              componentClass="radio"
              onChange={onChange}
              name="createSegment"
              value={false}
              checked={this.state.createSegment === false}
            >
              {__('Choose segment')}
            </FormControl>

            <FormControl
              componentClass="radio"
              onChange={onChangeSegment}
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
              {this.props.counts[this.state.segmentId] || 0} {__('customers')}
            </p>
          </CustomerCounts>
        </FlexItem>
      </FlexItem>
    );
  }
}

export default SegmentStep;
