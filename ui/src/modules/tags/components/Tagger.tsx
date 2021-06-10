import FilterableList from 'modules/common/components/filterableList/FilterableList';
import Spinner from 'modules/common/components/Spinner';
import { __ } from 'modules/common/utils';
import { ITag, ITagTypes } from 'modules/tags/types';
import React from 'react';

type Props = {
  type: ITagTypes | string;
  // targets can be conversation, customer, company etc ...
  targets?: any[];
  event?: 'onClick' | 'onExit';
  className?: string;

  // from container
  loading: boolean;
  tags: ITag[];
  tag: (tags: ITag[]) => void;
};

class Tagger extends React.Component<Props, { tagsForList: any[] }> {
  constructor(props) {
    super(props);

    this.state = {
      tagsForList: this.generateTagsParams(props.tags, props.targets)
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      tagsForList: this.generateTagsParams(nextProps.tags, nextProps.targets)
    });
  }

  /**
   * Returns array of tags object
   */
  generateTagsParams(tags: ITag[] = [], targets: any[] = []) {
    return tags.map(({ _id, name, colorCode, parentId }) => {
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
        selectedBy: state
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
    if (this.props.loading) {
      return <Spinner objective={true} />;
    }

    const { className, event, type } = this.props;

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
      treeView: true,
      items: JSON.parse(JSON.stringify(this.state.tagsForList))
    };

    if (event) {
      props[event] = this.tag;
    }

    return <FilterableList {...props} />;
  }
}

export default Tagger;
