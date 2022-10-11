import { Price, ReadMore, Service, SubService } from './styles';

import Icon from 'modules/common/components/Icon';
import React from 'react';
import { SUB_KINDS } from '../constants';
import { __ } from 'modules/common/utils';

type Props = {
  service: any;
};

class ServiceBox extends React.Component<Props, {}> {
  renderSubService(type) {
    if (!SUB_KINDS[type]) {
      return null;
    }

    return (
      Object.values(SUB_KINDS[type]) || []
    ).map((item: any, index: number) => (
      <SubService key={index}>{item}</SubService>
    ));
  }

  render() {
    const { service } = this.props;

    if (!service || service.mainType !== 'service' || !service.selfHosted) {
      return null;
    }

    const { prices, shortDescription, title } = service || {};

    return (
      <Service>
        <div>
          <Price>${prices ? prices.oneTime || prices.monthly : 0}</Price>
          <h5>{title}</h5>
          <div dangerouslySetInnerHTML={{ __html: shortDescription }} />
        </div>
        <ReadMore
          href="https://erxes.io/addons#selfHosted"
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
