import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TAG_TYPES } from 'modules/tags/constants';
import { Alert } from 'modules/common/utils';
import { FilterableList, Spinner } from '../..';

const propTypes = {
  type: PropTypes.oneOf(TAG_TYPES.ALL_LIST),
  targets: PropTypes.array,
  afterSave: PropTypes.func,
  event: PropTypes.oneOf(['onClick', 'onExit']),
  className: PropTypes.string,

  // from container
  loading: PropTypes.bool,
  tags: PropTypes.array,
  tag: PropTypes.func.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class Tagger extends Component {
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
        iconClass: 'ion-pricetag',
        iconColor: colorCode,
        selectedBy: state
      };
    });
  }

  tag(tags) {
    const { tag, targets, type, afterSave } = this.props;

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

    const param = {
      type,
      targetIds: targets.map(t => t._id),
      tagIds: tags.filter(t => t.selectedBy === 'all').map(t => t._id)
    };

    tag(param, error => {
      if (error) {
        return Alert.error(error.message);
      }

      const message =
        targets.length > 1
          ? `Selected ${type}s have been tagged!`
          : `The ${type} has been tagged!`;
      Alert.success(message);

      if (afterSave) {
        afterSave();
      }
    });
  }

  render() {
    if (this.props.loading) {
      return <Spinner objective />;
    }

    const { __ } = this.context;
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

Tagger.propTypes = propTypes;
Tagger.contextTypes = contextTypes;

export default Tagger;
