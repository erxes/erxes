import { __ } from 'modules/common/utils';
import { Show } from 'modules/engage/styles';
import { ISegment, ISegmentDoc, ISegmentField } from 'modules/segments/types';
import * as React from 'react';
import { SegmentsForm } from '../forms';
import Common from './Common';

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

  renderComponentContent = ({
    actionSelector,
    customerCounts,
    listContent
  }) => {
    const { renderContent } = this.props;
    const { createSegment } = this.state;

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

    return renderContent({ actionSelector, componentContent, customerCounts });
  };

  render() {
    const { counts, segments } = this.props;
    const { createSegment, segmentId } = this.state;

    const onChange = () => this.createSegment(false);
    const onChangeSegment = () => this.createSegment(true);

    return (
      <Common
        id={segmentId}
        type="segment"
        name="createSegment"
        onChange={onChange}
        onChangeToggle={onChangeSegment}
        changeList={this.changeSegment}
        listCount={counts}
        customers={counts[segmentId] || 0}
        list={segments}
        checked={createSegment}
        content={this.renderComponentContent}
      />
    );
  }
}

export default SegmentStep;
