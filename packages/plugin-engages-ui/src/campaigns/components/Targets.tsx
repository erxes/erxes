import EmptyState from '@erxes/ui/src/components/EmptyState';
import { SidebarCounter, SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { ListCounter } from '@erxes/ui-engage/src/styles';
import { Wrapper } from '@erxes/ui/src/styles/main';
import { Counts } from '@erxes/ui/src/types';

type Props<Target> = {
  messageType: string;
  targets: Target[];
  name: string;
  targetCount: Counts;
  defaultValues: string[];
  onChangeStep: (name: string, targetIds: string[]) => void;
  icons?: React.ReactNode[];
  loadingCount: boolean;
};

type State = {
  selectedIds: string[];
};

class Targets<
  Target extends { _id?: string; name?: string }
> extends React.Component<Props<Target>, State> {
  constructor(props) {
    super(props);

    this.state = { selectedIds: [] };
  }

  componentDidMount() {
    const { defaultValues } = this.props;

    if (defaultValues && defaultValues.length) {
      this.setState({ selectedIds: defaultValues });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(this.props.defaultValues) !==
      JSON.stringify(nextProps.defaultValues)
    ) {
      this.setState({ selectedIds: nextProps.defaultValues });
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
    const { targetCount, messageType, name, icons, loadingCount } = this.props;

    if (targets.length === 0) {
      return (
        <EmptyState icon="piechart" text={`No ${messageType}`} size="small" />
      );
    }

    return targets.map((target, index) => {
      const { _id = '' } = target;

      return (
        <ListCounter key={_id} chosen={selectedIds.includes(_id)}>
          <a
            href="#counter"
            tabIndex={0}
            onClick={this.onClick.bind(this, name, _id)}
          >
            {icons && icons[index]}
            {target.name}
            <SidebarCounter>
              {loadingCount ? '...loading' : targetCount[_id] || 0}
            </SidebarCounter>
          </a>
        </ListCounter>
      );
    });
  }

  render() {
    const { targets } = this.props;

    return (
      <Wrapper>
        <SidebarList>{this.renderTarget(targets)}</SidebarList>
      </Wrapper>
    );
  }
}

export default Targets;
