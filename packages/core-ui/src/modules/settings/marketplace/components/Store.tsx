import { Container, Services } from './styles';

import { FlexRow } from '@erxes/ui-settings/src/styles';
import { OS_SERVICES } from '../constants';
import PluginBox from './PluginBox';
import React from 'react';
import ServiceBox from './ServiceBox';
import Wrapper from 'modules/layout/components/Wrapper';
import { __ } from 'modules/common/utils';

class Store extends React.Component<{}, { plugins: any }> {
  constructor(props) {
    super(props);

    this.state = {
      plugins: []
    };
  }

  async componentDidMount() {
    fetch('https://erxes.io/plugins')
      .then(async response => {
        const plugins = await response.json();

        this.setState({ plugins });
      })
      .catch(e => {
        console.log(e);
      });
  }

  renderContent() {
    return (
      <Container>
        <h4>{__('Services')}</h4>
        <p>
          {__(
            'Upgrade your plan with these premium services for expert help and guidance'
          )}
        </p>
        <Services>
          {OS_SERVICES.map((service, index) => (
            <ServiceBox key={index} service={service} />
          ))}
        </Services>

        <FlexRow>awefaewfewfaef</FlexRow>
        <div>kkkk</div>

        <h4>{__('Plugins')}</h4>
        <p>{__('Customize and enhance your plugins limits')}</p>
        <PluginBox />

        <h4>{__('Add-ons')}</h4>
        <p>
          {__(
            'Increase the limits of individual plug-ins depending on your use'
          )}
        </p>
        <PluginBox />
      </Container>
    );
  }

  render() {
    console.log('plugins:', this.state.plugins);
    return <Wrapper content={this.renderContent()} />;
  }
}

export default Store;
