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
  plugin: any;
  plugins: any[];
  isAddon?: boolean;
  isOpenSource?: boolean;
};

class PluginBox extends React.Component<Props, {}> {
  renderPrice(prices) {
    if (!prices || this.props.isOpenSource) {
      return <b>{__('Free')}</b>;
    }

    return (
      <PerPrice>
        <h2>${prices.monthly || 20}</h2>
        <span>{__('per month')}</span>
      </PerPrice>
    );
  }

  renderAddon() {
    const { dependencies } = this.props.plugin || {};

    const dependentPlugins = this.props.plugins.filter(item =>
      dependencies.includes(item._id)
    );

    return (dependentPlugins || []).map(dependency => (
      <Addon key={dependency._id}>
        <img
          src={dependency.avatar || dependency.icon || '/images/no-plugin.png'}
          alt="dependency-plugin"
        />
        {__(dependency.title)}
      </Addon>
    ));
  }

  renderFooterLeftItems() {
    const { isAddon, plugin } = this.props;

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
          <span>{plugin.creator || __('erxes Inc')}</span>
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
              <div className="image-wrapper">
                <img
                  src={plugin.avatar || plugin.image || '/images/no-plugin.png'}
                  alt={plugin.title}
                />
              </div>
              {this.renderPrice(plugin.prices)}
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
