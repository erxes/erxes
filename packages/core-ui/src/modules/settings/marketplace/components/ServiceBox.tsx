import { Description, Price, Service, ServiceText } from './styles';

import Icon from 'modules/common/components/Icon';
import React from 'react';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';

type Props = {
  plugin: any;
};

class ServiceBox extends React.Component<Props, { showMore: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      showMore: false
    };
  }

  render() {
    const { plugin } = this.props;

    if (
      !plugin ||
      (plugin.mainType || '') !== 'service' ||
      !(plugin.displayLocations || []).includes('os')
    ) {
      return null;
    }

    const { prices, shortDescription, title } = plugin || {};
    // const domain = window.location.host;
    const showmore = shortDescription.includes('<ul');

    return (
      <Service
        // href={`https://erxes.io/marketplace-global?domain=${domain}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div>
          <h5>{title}</h5>
          <Price>
            ${prices ? prices.oneTime || prices.monthly : 0}
            <span>
              {prices && prices.oneTime
                ? '/ One Time'
                : prices && prices.monthly
                ? '/ Monthly'
                : ''}
            </span>
          </Price>
          <ServiceText showMore={this.state.showMore}>
            <Description
              showmore={this.state.showMore}
              className="description"
              dangerouslySetInnerHTML={{ __html: shortDescription }}
            />
            {showmore && (
              <Tip
                text={this.state.showMore ? 'Show less' : 'Show more'}
                placement="top"
              >
                <span
                  onClick={() =>
                    this.setState({ showMore: !this.state.showMore })
                  }
                >
                  <Icon icon="angle-down" />
                </span>
              </Tip>
            )}
          </ServiceText>
        </div>
      </Service>
    );
  }
}

export default ServiceBox;
