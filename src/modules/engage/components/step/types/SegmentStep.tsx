import { __ } from 'modules/common/utils';
import { Show } from 'modules/engage/styles';
import { ISegment, ISegmentDoc, ISegmentField } from 'modules/segments/types';
import * as React from 'react';
import { SegmentsForm } from '../forms';
import Common from './Common';

type Props = {
  onChange: (
    name: 'brandIds' | 'tagIds' | 'segmentIds',
    value: string[]
  ) => void;
  renderContent: any;
  segments: ISegment[];
  headSegments: ISegment[];
  segmentFields: ISegmentField[];
  segmentAdd: (params: { doc: ISegmentDoc }) => void;
  counts: (ids: string[]) => number;
  listCount: any;
  count: (segment: ISegmentDoc) => void;
  segmentIds: string[];
};

type State = {
  segmentIds: string[];
  createSegment: boolean;
};

class SegmentStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      segmentIds: props.segmentIds || [],
      createSegment: false
    };
  }

  createSegment = (createSegment: boolean) => {
    this.setState({ createSegment });

    if (createSegment === true) {
      this.changeSegment([]);
    }
  };

  changeSegment = (segmentIds: string[]) => {
    this.setState({ segmentIds });
    this.props.onChange('segmentIds', segmentIds);
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
    const { counts, segments, listCount } = this.props;
    const { createSegment, segmentIds } = this.state;

    const onChange = () => this.createSegment(false);
    const onChangeSegment = () => this.createSegment(true);

    return (
      <Common
        ids={segmentIds}
        type="segment"
        name="createSegment"
        onChange={onChange}
        onChangeToggle={onChangeSegment}
        changeList={this.changeSegment}
        counts={listCount}
        customers={counts(segmentIds)}
        list={segments}
        checked={createSegment}
        content={this.renderComponentContent}
      />
    );
  }
}

export default SegmentStep;
