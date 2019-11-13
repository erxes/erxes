import * as React from 'react';
import Collapse from 'react-bootstrap-latest/Collapse';
import { Count, Group, GroupHead, NotifyItem, Title } from './styles';

type Props = {
  label: string;
  color?: string;
};

type State = {
  open: boolean;
};
class ActionGroup extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };
  }

  onClick = () => this.setState({ open: !this.state.open });

  render() {
    const { color, label } = this.props;

    return (
      <Group>
        <GroupHead onClick={this.onClick}>
          <Count color={color}>
            <span>132</span>
          </Count>
          <Title>{label}</Title>
        </GroupHead>
        <Collapse in={this.state.open}>
          <div>
            <NotifyItem>
              Merged <b>Ganzorig</b> and <b>Ganzorig Bayarsaikhan</b>
            </NotifyItem>
          </div>
        </Collapse>
      </Group>
    );
  }
}

export default ActionGroup;
