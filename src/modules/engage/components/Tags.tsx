import { EmptyState, Icon } from 'modules/common/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { ITag } from 'modules/tags/types';
import * as React from 'react';
import { Tagli } from '../styles';

type Props = {
  tags: ITag[];
  changeTags: (value: string) => void;
  counts: any;
  defaultValue: string;
};

type State = {
  chosenTag: string;
};

class Tags extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      chosenTag: ''
    };
  }

  componentDidMount() {
    if (this.props.defaultValue !== '') {
      this.setState({ chosenTag: this.props.defaultValue });
    }
  }

  onClickTag = tagId => {
    if (tagId === this.state.chosenTag) {
      this.setState({ chosenTag: '' });
      this.props.changeTags('');
    } else {
      this.props.changeTags(tagId);
      this.setState({ chosenTag: tagId });
    }
  };

  renderItems(orderedTags) {
    const { counts } = this.props;

    if (orderedTags.length === 0) {
      return <EmptyState icon="piechart" text="No tags" size="small" />;
    }

    return orderedTags.map(tag => (
      <Tagli key={tag._id} chosen={this.state.chosenTag === tag._id}>
        <a tabIndex={0} onClick={this.onClickTag.bind(this, tag._id)}>
          <Icon icon="tag icon" style={{ color: tag.colorCode }} />
          {tag.name}
          <SidebarCounter>{counts[tag._id]}</SidebarCounter>
        </a>
      </Tagli>
    ));
  }
  render() {
    const { tags } = this.props;

    const orderedTags: ITag[] = [];

    tags.forEach(tag => {
      orderedTags.push(tag);
    });

    return <SidebarList>{this.renderItems(orderedTags)}</SidebarList>;
  }
}

export default Tags;
