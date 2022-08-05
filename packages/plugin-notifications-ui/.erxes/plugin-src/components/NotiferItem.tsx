import debounce from 'lodash/debounce';
import Icon from '@erxes/ui/src/components/Icon';
import * as React from 'react';
import RTG from 'react-transition-group';
import styled from 'styled-components';
import { Item } from '@erxes/ui-notifications/src/components/styles';

const Close = styled.div`
  position: absolute;
  right: 10px;
  top: 5px;
  font-size: 16px;
  transition: transform 0.2s ease;

  &:hover {
    cursor: pointer;
    transform: scale(1.1);
  }
`;

type Props = {
  children: React.ReactNode;
  closable?: boolean;
  background?: string;
  delay?: number;
};

type State = {
  show: boolean;
};

class NotifierItem extends React.Component<Props, State> {
  static defaultProps = {
    delay: 1000
  };

  constructor(props) {
    super(props);

    this.state = { show: false };
  }

  componentDidMount = () => {
    debounce(() => this.setState({ show: true }), this.props.delay)();
  };

  close = () => {
    this.setState({ show: false });
  };

  render() {
    const { children, closable = true, background } = this.props;

    return (
      <RTG.CSSTransition
        in={this.state.show}
        appear={true}
        timeout={500}
        classNames="slide-in-small"
        unmountOnExit={true}
      >
        <Item background={background}>
          {closable && (
            <Close onClick={this.close}>
              <Icon icon="times" />
            </Close>
          )}
          {children}
        </Item>
      </RTG.CSSTransition>
    );
  }
}

export default NotifierItem;
