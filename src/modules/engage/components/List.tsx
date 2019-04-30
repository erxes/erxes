import { EmptyState, Icon } from 'modules/common/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { ISegment } from 'modules/segments/types';
import * as React from 'react';
import { Segmentli } from '../styles';

type Props = {
  list: ISegment[] | any;
  changeList: (value: string) => void;
  counts: any;
  defaultValue: string;
};

type State = {
  selected: string;
};

class List extends React.Component<Props, State> {
  state = { selected: '' };

  componentDidMount() {
    if (this.props.defaultValue !== '') {
      this.setState({ selected: this.props.defaultValue });
    }
  }

  onClickSegment = id => {
    if (id === this.state.selected) {
      this.setState({ selected: '' });
      this.props.changeList('');
    } else {
      this.props.changeList(id);
      this.setState({ selected: id });
    }
  };

  renderItems(orderedSegments) {
    const { counts } = this.props;

    if (orderedSegments.length === 0) {
      return <EmptyState icon="piechart" text="No segments" size="small" />;
    }

    return orderedSegments.map(segment => (
      <Segmentli key={segment._id} chosen={this.state.selected === segment._id}>
        <a tabIndex={0} onClick={this.onClickSegment.bind(this, segment._id)}>
          {segment.subOf ? '\u00a0\u00a0\u00a0\u00a0\u00a0' : null}
          <Icon icon="piechart icon" style={{ color: segment.color }} />
          {segment.name}
          <SidebarCounter>{counts[segment._id]}</SidebarCounter>
        </a>
      </Segmentli>
    ));
  }

  render() {
    const { list } = this.props;

    const orderedList: ISegment[] | any = [];

    list.forEach(obj => {
      if (!obj.subOf) {
        orderedList.push(obj, ...obj.getSubSegments);
      }
    });

    return <SidebarList>{this.renderItems(orderedList)}</SidebarList>;
  }
}

export default List;
