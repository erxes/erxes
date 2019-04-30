import { __ } from 'modules/common/utils';
import { ISegment, ISegmentDoc, ISegmentField } from 'modules/segments/types';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { SegmentsForm } from '../..';
import Common from './Common';

const Show = styledTS<{ show: boolean }>(styled.div)`
  display: ${props => (props.show ? 'block' : 'none')};
`;

type Props = {
  onChange: (name: 'segmentId', value: string) => void;
  renderContent: any;
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

  createSegment = (createSegment: boolean) => {
    this.setState({ createSegment });

    if (createSegment === true) {
      this.changeSegment('');
    }
  };

  changeSegment = (segmentId: string) => {
    this.setState({ segmentId });
    this.props.onChange('segmentId', segmentId);
  };

  render() {
    const { renderContent, counts, segments } = this.props;
    const { createSegment, segmentId } = this.state;

    const onChange = () => this.createSegment(false);
    const onChangeSegment = () => this.createSegment(true);

    const content = ({ actionSelector, customerCounts, listContent }) => {
      const componentContent = (
        <>
          {listContent}
          <Show show={createSegment}>
            <SegmentsForm
              fields={this.props.segmentFields}
              create={this.props.segmentAdd}
              headSegments={this.props.headSegments}
              count={this.props.count}
              createSegment={this.createSegment}
            />
          </Show>
        </>
      );

      return (
        <>
          {renderContent({ actionSelector, componentContent, customerCounts })}
        </>
      );
    };

    return (
      <Common
        content={content}
        customers={counts[segmentId] || 0}
        name="createSegment"
        checked={createSegment}
        onChange={onChange}
        onChangeToggle={onChangeSegment}
        title="segment"
        list={segments}
        changeList={this.changeSegment}
        listCount={counts}
        id={segmentId}
      />
    );
  }
}

export default SegmentStep;
