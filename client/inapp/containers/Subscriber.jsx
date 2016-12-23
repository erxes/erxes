import React, { PropTypes } from 'react';

export default class Subscriber extends React.Component {
  constructor(props) {
    super(props);

    this.subscription = null;
    this.subscribeToMoreOptions = {};
  }

  componentWillReceiveProps(nextProps) {
    if (!this.subscription && !nextProps.data.loading) {
      const { subscribeToMore } = this.props.data;

      this.subscription = [subscribeToMore(this.subscribeToMoreOptions)];
    }
  }
}

Subscriber.propTypes = {
  data: PropTypes.object.isRequired,
};
