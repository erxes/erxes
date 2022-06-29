import React from 'react';

import Leftbar from './Leftbar';
import PluginPreview from './PluginPreview';
import Wrapper from '../containers/Wrapper';

import { ImageWrapper } from '../styles';

class Installer extends React.Component {
  renderContent() {
    return (
      <>
        <ImageWrapper>
          <span>Product Experience management template</span>
          <img src="/images/marketplace.png" alt="installer" />
        </ImageWrapper>
        <PluginPreview />
      </>
    );
  }

  render() {
    return <Wrapper content={this.renderContent()} leftSidebar={<Leftbar />} />;
  }
}

export default Installer;
