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

    if (!service || !service.selfHosted) {
      return null;
    }

    const { price, description, title } = service || {};

    return (
      <Service>
        <div>
          <Price>
            ${price ? price.oneTime || price.monthly : 0}
            <span>{__('Per month')}</span>
          </Price>
          <h5>{title}</h5>
          <p>
            {description} <br />
            {/* {this.renderSubService(type)} */}
          </p>
        </div>
        <ReadMore>
          <span>{__('Read more')}</span> <Icon icon="rightarrow" size={16} />
        </ReadMore>
      </Service>
    );
  }
}

export default ServiceBox;
