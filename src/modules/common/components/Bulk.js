import React from 'react';
import _ from 'underscore';

export default class Bulk extends React.Component {
  constructor(props) {
    super(props);

    this.state = { bulk: [] };

    this.toggleBulk = this.toggleBulk.bind(this);
    this.emptyBulk = this.emptyBulk.bind(this);
    this.refetch = this.refetch.bind(this);
  }

  refetch() {}

  toggleBulk(conv, toAdd) {
    let { bulk } = this.state;

    // remove old entry
    bulk = _.without(bulk, _.findWhere(bulk, { _id: conv._id }));

    if (toAdd) {
      bulk.push(conv);
    }

    this.setState({ bulk });
  }

  emptyBulk() {
    this.refetch();
    this.setState({ bulk: [] });
  }
}
