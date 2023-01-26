import { Price, ReadMore, Service } from './styles';

import Icon from 'modules/common/components/Icon';
import React from 'react';
import { __ } from 'modules/common/utils';

type Props = {
  plugin: any;
};

class ServiceBox extends React.Component<Props, {}> {
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
    const domain = window.location.host;

    return (
      <Service>
        <div>
          <Price>${prices ? prices.oneTime || prices.monthly : 0}</Price>
          <h5>{title}</h5>
          <div dangerouslySetInnerHTML={{ __html: shortDescription }} />
        </div>
        <ReadMore
          href={`https://erxes.io/marketplace-global?domain=${domain}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{__('Read more')}</span> <Icon icon="rightarrow" size={16} />
        </ReadMore>
      </Service>
    );
  }
}

export default ServiceBox;
