import { ITag, ITagTypes } from '../types';

import FilterableList from '@erxes/ui/src/components/filterableList/FilterableList';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  type: ITagTypes | string;
  // targets can be conversation, customer, company etc ...
  targets?: any[];
  event?: 'onClick' | 'onExit';
  className?: string;
  disableTreeView?: boolean;

  // from container
  loading: boolean;
  tags: ITag[];
  tag: (tags: ITag[]) => void;
  singleSelect?: boolean;
};

type State = {
  tagsForList: any[];
  keysPressed: any;
  cursor: number;
};

class Tagger extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      tagsForList: this.generateTagsParams(props.tags, props.targets),
      keysPressed: {},
      cursor: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      tagsForList: this.generateTagsParams(nextProps.tags, nextProps.targets)
    });
  }

  componentDidMount() {
    if (this.props.type === 'inbox:conversation') {
      document.addEventListener('keydown', this.handleArrowSelection);
    }
  }

  componentWillUnmount() {
    if (this.props.type === 'inbox:conversation') {
      document.removeEventListener('keydown', this.handleArrowSelection);
    }
  }

  handleArrowSelection = (event: any) => {
    const { cursor } = this.state;

    const maxCursor: number = this.state.tagsForList.length;

    switch (event.keyCode) {
      case 13:
        const element = document.getElementsByClassName(
          'tag-' + cursor
        )[0] as HTMLElement;
        const showTags = document.getElementById('conversationTags');

        if (element && showTags) {
          element.click();

          this.tag(this.state.tagsForList);
          showTags.click();
        }
        break;
      case 38:
        // Arrow move up
        if (cursor > 0) {
          this.setState({ cursor: cursor - 1 });
        }
        if (cursor === 0) {
          this.setState({ cursor: maxCursor });
        }
        break;
      case 40:
        // Arrow move down
        if (cursor < maxCursor - 1) {
          this.setState({ cursor: cursor + 1 });
        } else {
          this.setState({ cursor: 0 });
        }
        break;
      default:
        break;
    }
  };

  /**
   * Returns array of tags object
   */
  generateTagsParams(tags: ITag[] = [], targets: any[] = []) {
    return tags.map(({ _id, name, colorCode, parentId }, i) => {
      // Current tag's selection state (all, some or none)
      const count = targets.reduce(
        (memo, target) => memo + ((target.tagIds || []).includes(_id) ? 1 : 0),
        0
      );

      let state = 'none';

      if (count > 0) {
        if (count === targets.length) {
          state = 'all';
        } else if (count < targets.length) {
          state = 'some';
        }
      }

      return {
        _id,
        title: name,
        iconClass: 'icon-tag-alt',
        iconColor: colorCode,
        parentId,
        selectedBy: state,
        itemClassName:
          this.props.type === 'inbox:conversation' && this.state
            ? `tag-${i}`
            : '',
        itemActiveClass: this.state && this.state.cursor === i && 'active'
      };
    });
  }

  tag = tags => {
    const { tag } = this.props;

    // detect changes
    const { tagsForList } = this.state;

    const unchanged = tagsForList.reduce(
      (prev, current, index) =>
        prev && current.selectedBy === tags[index].selectedBy,
      true
    );

    if (unchanged) {
      return;
    }

    tag(tags.filter(t => t.selectedBy === 'all').map(t => t._id));
  };

  render() {
    const { className, event, type, loading, disableTreeView } = this.props;

    if (loading) {
      return <Spinner objective={true} />;
    }

    const links = [
      {
        title: __('Manage tags'),
        href: `/tags/${type}`
      }
    ];

    const props = {
      className,
      links,
      selectable: true,
      treeView: disableTreeView ? false : true,
      items: JSON.parse(JSON.stringify(this.state.tagsForList)),
      isIndented: true,
      singleSelect: this.props.singleSelect
    };

    if (event) {
      props[event] = this.tag;
    }

    return <FilterableList {...props} />;
  }
}

export default Tagger;
