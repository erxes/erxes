import { toggleCheckBoxes } from "modules/common/utils";
import { Component } from "react";

export interface IBulkState {
  bulk?: any[];
  isAllSelected?: boolean;
}

export default class Bulk<P, S extends IBulkState> extends Component<P, S> {
  constructor(props) {
    super(props);

    this.state = { bulk: [], isAllSelected: false } as S;

    this.toggleBulk = this.toggleBulk.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.emptyBulk = this.emptyBulk.bind(this);
    this.refetch = this.refetch.bind(this);
  }

  public toggleBulk(target: any, toAdd?: boolean) {
    let { bulk } = this.state;

    // remove old entry
    bulk = bulk.filter(el => el._id !== target._id);

    if (toAdd) {
      bulk.push(target);
    }

    this.setState({ bulk });
  }

  public toggleAll(targets: any, containerId: string) {
    if (this.state.isAllSelected) {
      this.emptyBulk();
    } else {
      this.setState({ bulk: targets });
    }

    const { isAllSelected } = this.state;

    toggleCheckBoxes(containerId, !isAllSelected);

    this.setState({ isAllSelected: !isAllSelected });
  }

  public emptyBulk() {
    this.refetch();
    this.setState({ bulk: [], isAllSelected: false });
  }

  protected refetch(): any {
    return false;
  }
}
