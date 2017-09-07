/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/href-no-hash */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { CountsByTag, EmptyState } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from '/imports/api/integrations/constants';

const propTypes = {
  channels: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  counts: PropTypes.object,
};

class Sidebar extends Component {
  static renderChannel(channel, counts) {
    const onClick = () => {
      Wrapper.Sidebar.filter('channelId', channel._id);
    };

    return (
      <li key={channel._id}>
        <a className={Wrapper.Sidebar.getActiveClass('channelId', channel._id)} onClick={onClick}>
          <span className="icon">#</span>
          {channel.name}
          <span className="counter">
            {counts.byChannels[channel._id]}
          </span>
        </a>
      </li>
    );
  }

  static renderBrand(brand, counts) {
    const onClick = () => {
      Wrapper.Sidebar.filter('brandId', brand._id);
    };

    return (
      <li key={brand._id}>
        <a className={Wrapper.Sidebar.getActiveClass('brandId', brand._id)} onClick={onClick}>
          <span className="icon">#</span>
          {brand.name}
          <span className="counter">
            {counts.byBrands[brand._id]}
          </span>
        </a>
      </li>
    );
  }

  static renderIntegration(integrationType, index, counts) {
    const onClick = () => {
      Wrapper.Sidebar.filter('integrationType', integrationType);
    };

    return (
      <li key={index}>
        <a
          className={Wrapper.Sidebar.getActiveClass('integrationType', integrationType)}
          onClick={onClick}
        >
          <span className="icon">#</span>
          {integrationType}
          <span className="counter">
            {counts.byIntegrationTypes[integrationType]}
          </span>
        </a>
      </li>
    );
  }

  static renderTag(tag, counts) {
    const onClick = () => {
      Wrapper.Sidebar.filter('tagId', tag._id);
    };

    return (
      <li key={tag._id}>
        <a className={Wrapper.Sidebar.getActiveClass('tagId', tag._id)} onClick={onClick}>
          <i className="ion-pricetag icon" style={{ color: tag.colorCode }} />
          {tag.name}
          <span className="counter">
            {counts.byTags[tag._id]}
          </span>
        </a>
      </li>
    );
  }

  static clearStatusFilter() {
    Wrapper.Sidebar.filter('participating', '');
    Wrapper.Sidebar.filter('status', '');
    Wrapper.Sidebar.filter('unassigned', '');
    Wrapper.Sidebar.filter('starred', '');
  }

  // unassigned, participatedUser, status, etc ...
  static renderSingleFilter(queryParamName, queryParamValue, countName, text, counts) {
    const onClick = () => {
      // clear previous values
      Sidebar.clearStatusFilter();

      Wrapper.Sidebar.filter(queryParamName, queryParamValue);
    };

    return (
      <li>
        <a
          className={Wrapper.Sidebar.getActiveClass(queryParamName, queryParamValue)}
          onClick={onClick}
        >
          {text}
          <span className="counter">
            {counts[countName]}
          </span>
        </a>
      </li>
    );
  }

  static renderSectionHeader(queryParamName, buttonLink) {
    const onClick = () => {
      Wrapper.Sidebar.filter(queryParamName, '');
    };

    return (
      <Wrapper.Sidebar.Section.QuickButtons>
        <a href={buttonLink} className="quick-button">
          <i className="ion-gear-a" />
        </a>
        {FlowRouter.getQueryParam(queryParamName)
          ? <a href="" className="quick-button" onClick={onClick}>
              <i className="ion-close-circled" />
            </a>
          : null}
      </Wrapper.Sidebar.Section.QuickButtons>
    );
  }

  static renderFilterSectionHeader() {
    return (
      <Wrapper.Sidebar.Section.QuickButtons>
        {FlowRouter.getQueryParam('participating') ||
          FlowRouter.getQueryParam('unassigned') ||
          FlowRouter.getQueryParam('status') ||
          FlowRouter.getQueryParam('starred')
          ? <a href="" className="quick-button" onClick={Sidebar.clearStatusFilter}>
              <i className="ion-close-circled" />
            </a>
          : null}
      </Wrapper.Sidebar.Section.QuickButtons>
    );
  }

  static renderEmptyState(list, text, iconClassName) {
    if (list.length === 0) {
      return <EmptyState icon={<i className={iconClassName} />} text={text} size="small" />;
    }

    return null;
  }

  render() {
    const { channels, tags, brands, counts } = this.props;
    const integrationTypes = INTEGRATIONS_TYPES.ALL_LIST;
    const { Title } = Wrapper.Sidebar.Section;
    const manageBrands = FlowRouter.path('settings/brands/list');
    const manageChannels = FlowRouter.path('settings/channels/list');
    const manageIntegrations = FlowRouter.path('settings/integrations/list');

    return (
      <Wrapper.Sidebar>
        <Wrapper.Sidebar.Section collapsible={channels.length > 5}>
          <Title>Channels</Title>
          {Sidebar.renderSectionHeader('channelId', manageChannels)}
          <ul className="sidebar-list">
            {channels.map(channel => Sidebar.renderChannel(channel, counts))}
            {Sidebar.renderEmptyState(channels, 'No channel', 'ion-pound')}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section collapsible={brands.length > 5}>
          <Title>Brands</Title>
          {Sidebar.renderSectionHeader('brandId', manageBrands)}
          <ul className="sidebar-list">
            {brands.map(brand => Sidebar.renderBrand(brand, counts))}
            {Sidebar.renderEmptyState(brands, 'No brand', 'ion-flag')}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section collapsible={integrationTypes.length > 5}>
          <Title>Integrations</Title>
          {Sidebar.renderSectionHeader('integrationType', manageIntegrations)}
          <ul className="sidebar-list">
            {integrationTypes.map((t, i) => Sidebar.renderIntegration(t, i, counts))}
            {Sidebar.renderEmptyState(integrationTypes, 'No integration', 'ion-flag')}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section>
          <Title>Filter by status</Title>
          {Sidebar.renderFilterSectionHeader()}

          <ul className="sidebar-list">
            {Sidebar.renderSingleFilter('unassigned', 'true', 'unassiged', 'Unassigned', counts)}

            {Sidebar.renderSingleFilter(
              'participating',
              'true',
              'participating',
              'Participating',
              counts,
            )}

            {Sidebar.renderSingleFilter(
              'status',
              CONVERSATION_STATUSES.CLOSED,
              'resolved',
              'Resolved',
              counts,
            )}

            {Sidebar.renderSingleFilter('starred', 'true', 'starred', 'Starred', counts)}
          </ul>
        </Wrapper.Sidebar.Section>

        <CountsByTag tags={tags} counts={counts.byTags} manageUrl="tags/conversation" />
      </Wrapper.Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
