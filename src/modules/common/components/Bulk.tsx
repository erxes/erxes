import * as React from 'react';
import { toggleCheckBoxes } from '../utils';

export interface IBulkContentProps {
  isAllSelected: boolean;
  bulk: any[];
  emptyBulk: () => void;
  toggleBulk: (target: any, toAdd: boolean) => void;
  toggleAll: (targets: any[], containerId: string) => void;
}

type Props = {
  content: (props: IBulkContentProps) => React.ReactNode;
  refetch?: () => void;
};

type State = {
  bulk: string[];
  isAllSelected: boolean;
};

export default abstract class Bulk extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { bulk: [], isAllSelected: false };
  }

  toggleBulk = (target, toAdd) => {
    let { bulk } = this.state;
    // remove old entry
    bulk = bulk.filter((el: any) => el._id !== target._id);

    if (toAdd) {
      bulk.push(target);
    }

    this.setState({ bulk });
  };

  toggleAll = (targets, containerId) => {
    if (this.state.isAllSelected) {
      this.emptyBulk();
    } else {
      this.setState({ bulk: targets });
    }

    const { isAllSelected } = this.state;

    toggleCheckBoxes(containerId, !isAllSelected);

    this.setState({ isAllSelected: !isAllSelected });
  };

  emptyBulk = () => {
    const { refetch } = this.props;

    if (refetch) {
      refetch();
    }

    this.setState({ bulk: [], isAllSelected: false });
  };

  render() {
    const { toggleBulk, toggleAll, emptyBulk } = this;
    const { bulk, isAllSelected } = this.state;

    return this.props.content({
      bulk,
      isAllSelected,
      emptyBulk,
      toggleBulk,
      toggleAll
    });
  }
}
