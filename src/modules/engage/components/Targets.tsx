import { EmptyState, Icon } from 'modules/common/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import * as React from 'react';
import { ListCounter, ListWrapper } from '../styles';
import { TargetCount } from '../types';

type Props<Target> = {
  messageType: string;
  targets: Target[];
  name: string;
  targetCount: TargetCount;
  defaultValues: string[];
  onChangeStep: (name: string, targetIds: string[]) => void;
};

type State = {
  selectedIds: string[];
};

class Targets<Target> extends React.Component<Props<Target>, State> {
  constructor(props) {
    super(props);

    this.state = { selectedIds: [] };
  }

  componentDidMount() {
    const { defaultValues } = this.props;

    if (defaultValues !== []) {
      this.setState({ selectedIds: defaultValues });
    }
  }

  onClick = (name: string, targetId: string) => {
    const { selectedIds } = this.state;

    if (!selectedIds.includes(targetId)) {
      const updatedIds = [...selectedIds, targetId];

      this.setState({ selectedIds: updatedIds }, () => {
        this.props.onChangeStep(name, updatedIds);
      });
    } else {
      const filteredIds = selectedIds.filter(target => target !== targetId);

      this.setState({ selectedIds: filteredIds }, () => {
        this.props.onChangeStep(name, filteredIds);
      });
    }
  };

  renderTarget(targets: Target[]) {
    const { selectedIds } = this.state;
    const { targetCount, messageType, name } = this.props;

    if (targets.length === 0) {
      return (
        <EmptyState icon="piechart" text={`No ${messageType}`} size="small" />
      );
    }

    return targets.map(target => {
      const { _id, subOf, color, colorCode } = target;

      return (
        <ListCounter key={_id} chosen={selectedIds.includes(_id)}>
          <a tabIndex={0} onClick={this.onClick.bind(this, name, _id)}>
            {subOf ? '\u00a0\u00a0\u00a0\u00a0\u00a0' : null}
            <Icon icon="piechart icon" style={{ color: color || colorCode }} />
            {target.name}
            <SidebarCounter>{targetCount[_id] || 0}</SidebarCounter>
          </a>
        </ListCounter>
      );
    });
  }

  render() {
    const { targets } = this.props;

    return (
      <ListWrapper>
        <SidebarList>{this.renderTarget(targets)}</SidebarList>
      </ListWrapper>
    );
  }
}

export default Targets;
