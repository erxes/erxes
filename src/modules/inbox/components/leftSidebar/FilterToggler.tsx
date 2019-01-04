import { Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { GroupTitle } from './styles';

type Props = {
  groupText: string;
  isOpen: boolean;
  toggle: (params: { isOpen: boolean }) => void;
};

type State = {
  isOpen: boolean;
};

export default class FilterToggler extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isOpen: props.isOpen };
  }

  onClick = () => {
    const { isOpen } = this.state;

    this.setState({ isOpen: !isOpen });
    this.props.toggle({ isOpen: !isOpen });
  };

  render() {
    const { groupText, children } = this.props;
    const { isOpen } = this.state;

    return (
      <>
        <GroupTitle onClick={this.onClick} isOpen={isOpen}>
          {__(groupText)}
          <Icon icon="downarrow" />
        </GroupTitle>
        {this.state.isOpen && children}
      </>
    );
  }
}
