import React from 'react';
import { toggleCheckBoxes } from 'modules/common/utils';

export default class Bulk extends React.Component {
  constructor(props) {
    super(props);

    this.state = { bulk: [], isAllSelected: false };

    this.toggleBulk = this.toggleBulk.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.emptyBulk = this.emptyBulk.bind(this);
    this.refetch = this.refetch.bind(this);
  }

  refetch() {}

  toggleBulk(target, toAdd) {
    let { bulk } = this.state;

    // remove old entry
    bulk = bulk.filter(el => el._id !== target._id);

    if (toAdd) {
      bulk.push(target);
    }

    this.setState({ bulk });
  }

  toggleAll(targets, containerId) {
    if (this.state.isAllSelected) {
      this.emptyBulk();
    } else {
      this.setState({ bulk: targets });
    }

    const { isAllSelected } = this.state;

    toggleCheckBoxes(containerId, !isAllSelected);

    this.setState({ isAllSelected: !isAllSelected });
  }

  emptyBulk() {
    this.refetch();
    this.setState({ bulk: [] });
  }
}
