import {
  AddOns,
  Addon,
  FooterItem,
  ItemBox,
  MoreBtn,
  PerPrice,
  PluginBoxFooter,
  PluginBoxHeader,
  PluginContent
} from './styles';

import Icon from 'modules/common/components/Icon';
import { Link } from 'react-router-dom';
import React from 'react';
import { __ } from 'modules/common/utils';

type Props = {
  plugin?: any;
  isAddon?: boolean;
};

class PluginBox extends React.Component<Props, {}> {
  renderPrice(price) {
    if (!price) {
      return <b>{__('Free')}</b>;
    }

    return (
      <PerPrice>
        <h2>${price.monthly || 20}</h2>
        <span>{__('per month')}</span>
      </PerPrice>
    );
  }

  renderAddon() {
    return (
      <Addon>
        <img src={'/images/no-plugin.png'} alt="plugin" />
        {__('Team Inbox')}
      </Addon>
    );
  }

  renderFooterLeftItems() {
    const { isAddon } = this.props;

    if (isAddon) {
      return (
        <AddOns>
          <span>{__('Works with')}</span>
          {this.renderAddon()}
        </AddOns>
      );
    }

    return (
      <>
        <FooterItem>
          <Icon icon="user" size={14} />
          <span>erxes Inc</span>
        </FooterItem>
        <FooterItem>
          <Icon icon="chart-bar" size={14} />
          <span>1,000+ active installations</span>
        </FooterItem>
      </>
    );
  }

  render() {
    const { plugin } = this.props;

    if (!plugin) {
      return null;
    }

    return (
      <ItemBox>
        <Link to={`installer/details/${plugin._id}`}>
          <PluginContent>
            <PluginBoxHeader>
              <img
                src={plugin.image || '/images/no-plugin.png'}
                alt={plugin.title}
              />
              {this.renderPrice(plugin.price)}
            </PluginBoxHeader>
            <h5>{__(plugin.title)}</h5>
            <div
              className="short-desc"
              dangerouslySetInnerHTML={{
                __html: plugin.shortDescription
              }}
            />
          </PluginContent>
          <PluginBoxFooter>
            <div>{this.renderFooterLeftItems()}</div>

            <MoreBtn>
              <Icon icon="arrow-right" size={20} />
            </MoreBtn>
          </PluginBoxFooter>
        </Link>
      </ItemBox>
    );
  }
}

export default PluginBox;
