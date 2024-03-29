import { ITag, ITagTypes } from '../types';

import Button from '@erxes/ui/src/components/Button';
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
  totalCount: number;
  singleSelect?: boolean;
  onLoadMore?: (page: number) => void;
};

type State = {
  tagsForList: any[];
  keysPressed: any;
  cursor: number;
  page: number;
};

class Tagger extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      tagsForList: this.generateTagsParams(props.tags, props.targets),
      keysPressed: {},
      cursor: 0,
      page: 1
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
          this.setState({ cursor: maxCursor - 1 });
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
        itemActiveClass:
          this.props.type === 'inbox:conversation' &&
          this.state &&
          this.state.cursor === i &&
          'active'
      };
    });
  }

  onLoad = () => {
    this.setState(
      {
        page: this.state.page + 1
      },
      () => {
        // tslint:disable-next-line:no-unused-expression
        this.props.onLoadMore && this.props.onLoadMore(this.state.page);
      }
    );
  };

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

  renderLoadMore = () => {
    const { loading, tags, totalCount = 0 } = this.props;

    if (tags.length >= totalCount) {
      return null;
    }

    return (
      <Button
        block={true}
        btnStyle="link"
        onClick={() => this.onLoad()}
        icon="redo"
        uppercase={false}
      >
        {loading ? 'Loading...' : 'Load more'}
      </Button>
    );
  };

  render() {
    const { className, event, type, loading, disableTreeView } = this.props;

    if (loading) {
      return <Spinner objective={true} />;
    }

    const links = [
      {
        title: __('Manage tags'),
        href: `/settings/tags/${type}`
      }
    ];

    const props = {
      className,
      links,
      selectable: true,
      treeView: disableTreeView ? false : true,
      items: JSON.parse(JSON.stringify(this.state.tagsForList)),
      isIndented: false,
      singleSelect: this.props.singleSelect,
      renderLoadMore: this.renderLoadMore
    };

    if (event) {
      props[event] = this.tag;
    }

    return <FilterableList {...props} />;
  }
}

export default Tagger;
