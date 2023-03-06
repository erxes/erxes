import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

type Props = {};

class Sidebar extends React.Component<Props> {
  private abortController;

  constructor(props) {
    super(props);
    this.abortController = new AbortController();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  render() {
    return <Wrapper.Sidebar hasBorder={true}>aaa</Wrapper.Sidebar>;
  }
}

export default Sidebar;
