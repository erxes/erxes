import { EmptyState, Icon } from 'modules/common/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { ISegment } from 'modules/segments/types';
import * as React from 'react';
import { Segmentli } from '../styles';

type Props = {
  segments: ISegment[];
  changeSegments: (value: string) => void;
  counts: any;
  defaultValue: string;
};

type State = {
  chosenSegment: string
}

class Segments extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      chosenSegment: ''
    };

    this.onClickSegment = this.onClickSegment.bind(this);
  }

  componentDidMount() {
    if (this.props.defaultValue !== '') {
      this.setState({ chosenSegment: this.props.defaultValue });
    }
  }

  onClickSegment(segmentId) {
    if (segmentId === this.state.chosenSegment) {
      this.setState({ chosenSegment: '' });
      this.props.changeSegments('');
    } else {
      this.props.changeSegments(segmentId);
      this.setState({ chosenSegment: segmentId });
    }
  }

  renderItems(orderedSegments) {
    const { counts } = this.props;

    if (orderedSegments.length === 0) {
      return <EmptyState icon="piechart" text="No segments" size="small" />;
    }

    return orderedSegments.map(segment => (
      <Segmentli
        key={segment._id}
        chosen={this.state.chosenSegment === segment._id}
      >
        <a tabIndex={0} onClick={() => this.onClickSegment(segment._id)}>
          {segment.subOf ? '\u00a0\u00a0\u00a0\u00a0\u00a0' : null}
          <Icon icon="piechart icon" style={{ color: segment.color }} />
          {segment.name}
          <SidebarCounter>{counts[segment._id]}</SidebarCounter>
        </a>
      </Segmentli>
    ));
  }

  render() {
    const { segments } = this.props;

    const orderedSegments: ISegment[] = [];

    segments.forEach(segment => {
      if (!segment.subOf) {
        orderedSegments.push(segment, ...segment.getSubSegments);
      }
    });

    return <SidebarList>{this.renderItems(orderedSegments)}</SidebarList>;
  }
}

export default Segments;
