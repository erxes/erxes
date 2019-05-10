import { Icon } from 'modules/common/components';
import * as React from 'react';
import { BrowserSupportContainer, Layout } from '../styles';

class BrowserSupport extends React.Component<{}, { isOpen: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: true
    };
  }

  closeBrowserSupportContainer = () => {
    this.setState({ isOpen: false });
  };

  render() {
    return (
      <BrowserSupportContainer isOpen={this.state.isOpen}>
        <p>This site is not fully compatible with your browser. </p>
        <Icon icon="cancel-1" onClick={this.closeBrowserSupportContainer} />
      </BrowserSupportContainer>
    );
  }
}

export default BrowserSupport;
