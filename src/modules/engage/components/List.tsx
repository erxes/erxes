import { EmptyState, Icon } from 'modules/common/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { ISegment } from 'modules/segments/types';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import { ListCounter } from '../styles';

type Props = {
  list: IBrand | ISegment[] | any;
  type: string;
  changeList: (value: string[]) => void;
  counts: any;
  defaultValue: string[];
};

type State = {
  selected: string[];
};

class List extends React.Component<Props, State> {
  state = { selected: [] };

  componentDidMount() {
    if (this.props.defaultValue !== []) {
      this.setState({ selected: this.props.defaultValue });
    }
  }

  onClick = id => {
    const { selected }: any = this.state;

    if (!selected.includes(id)) {
      const selectedValues = [...selected, id];
      this.setState({ selected: selectedValues }, () => {
        this.props.changeList(selectedValues);
      });
    } else {
      const filterdValue = selected.filter(item => item !== id);
      this.setState({ selected: filterdValue }, () => {
        this.props.changeList(filterdValue);
      });
    }
  };

  renderItems(orderedList) {
    const { selected }: any = this.state;
    const { counts, type } = this.props;

    if (orderedList.length === 0) {
      return <EmptyState icon="piechart" text={`No ${type}`} size="small" />;
    }

    return orderedList.map(item => {
      return (
        <ListCounter key={item._id} chosen={selected.includes(item._id)}>
          <a tabIndex={0} onClick={this.onClick.bind(this, item._id)}>
            {item.subOf ? '\u00a0\u00a0\u00a0\u00a0\u00a0' : null}
            <Icon
              icon="piechart icon"
              style={{ color: item.color || item.colorCode }}
            />
            {item.name}
            <SidebarCounter>{counts[item._id] || 0}</SidebarCounter>
          </a>
        </ListCounter>
      );
    });
  }

  render() {
    const { list, type } = this.props;

    const order = segments => {
      const orderedSegments: ISegment[] = [];

      segments.forEach(segment => {
        if (!segment.subOf) {
          orderedSegments.push(segment, ...segment.getSubSegments);
        }
      });

      return orderedSegments;
    };

    const orderedList = type === 'segment' ? order(list) : list;

    return <SidebarList>{this.renderItems(orderedList)}</SidebarList>;
  }
}

export default List;
