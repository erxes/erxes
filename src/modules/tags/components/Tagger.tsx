import { FilterableList, Spinner } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { ITag } from 'modules/tags/types';
import React, { Component } from 'react';

type Props = {
  type: string,
  targets: string[],
  event?: string,
  className?: string,

  // from container
  loading: boolean,
  tags: ITag[],
  tag: (tags: ITag[]) => void
};

class Tagger extends Component<Props, { tagsForList: any[] }> {
  constructor(props) {
    super(props);

    this.state = {
      tagsForList: this.generateTagsParams(props.tags, props.targets)
    };

    this.tag = this.tag.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      tagsForList: this.generateTagsParams(nextProps.tags, nextProps.targets)
    });
  }

  /**
   * Returns array of tags object
   */
  generateTagsParams(tags = [], targets = []) {
    return tags.map(({ _id, name, colorCode }) => {
      // Current tag's selection state (all, some or none)
      const count = targets.reduce(
        (memo, target) =>
          memo + (target.tagIds && target.tagIds.indexOf(_id) > -1),
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
        iconClass: 'icon-tag',
        iconColor: colorCode,
        selectedBy: state
      };
    });
  }

  tag(tags) {
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
  }

  render() {
    if (this.props.loading) {
      return <Spinner objective />;
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
      items: JSON.parse(JSON.stringify(this.state.tagsForList)),
      [event]: this.tag
    };

    return <FilterableList {...props} />;
  }
}

export default Tagger;
