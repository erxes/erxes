import { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  objects: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired
};

class List extends Component {
  constructor(props) {
    super(props);

    this.renderObjects = this.renderObjects.bind(this);
  }

  renderObjects() {
    const { objects, members, remove, save, refetch } = this.props;

    return objects.map(object =>
      this.renderChannelName({
        key: object._id,
        object,
        members,
        remove,
        refetch,
        save
      })
    );
  }

  render() {
    return this.renderContent();
  }
}

List.propTypes = propTypes;

export default List;
