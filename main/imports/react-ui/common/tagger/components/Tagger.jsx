import React, { PropTypes, Component } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';
import { FilterableList } from '../..';


const propTypes = {
  tags: PropTypes.array.isRequired,
  targets: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  tag: PropTypes.func.isRequired,
  afterSave: PropTypes.func,
  event: PropTypes.oneOf(['onClick', 'onExit']),
  className: PropTypes.string,
};

class Tagger extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tagsForList: this.generateTagsParams(props.tags, props.targets),
    };

    this.tag = this.tag.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ tagsForList: this.generateTagsParams(nextProps.tags, nextProps.targets) });
  }

  /**
   * Returns array of tags object
   */
  generateTagsParams(tags, targets) {
    return tags.map(({ _id, name, colorCode }) => {
      // Current tag's selection state (all, some or none)
      const count = targets.reduce((memo, target) =>
        memo + (target.tagIds && target.tagIds.indexOf(_id) > -1), 0);

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
        image: <i className="icon ion-pricetags" style={{ color: colorCode }} />,
        selectedBy: state,
      };
    });
  }

  tag(tags) {
    const { tag, targets, type, afterSave } = this.props;
    const param = {
      targetIds: targets.map(t => t._id),
      tagIds: tags.filter(t => t.selectedBy === 'all').map(t => t._id),
    };

    // eslint-disable-next-line consistent-return
    tag(param, (error) => {
      if (error) {
        return Alert.error(error.reason);
      }

      const message = targets.length > 1
        ? `Selected ${type}s have been tagged!`
        : `The ${type} has been tagged!`;
      Alert.success(message);

      if (afterSave) {
        afterSave();
      }
    });
  }

  render() {
    const { className, event, type } = this.props;

    const links = [{
      title: 'Manage tags',
      href: FlowRouter.path('tags/list', { type }),
    }];

    const props = {
      className,
      links,
      items: this.state.tagsForList,
      [event]: this.tag,
    };

    return (
      <FilterableList {...props} />
    );
  }
}

Tagger.propTypes = propTypes;

export default Tagger;
