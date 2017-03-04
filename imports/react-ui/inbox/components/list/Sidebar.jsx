/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/href-no-hash */

import React, { PropTypes } from 'react';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { EmptyState, LoadingSidebar } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from '/imports/api/integrations/constants';

const propTypes = {
  channels: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  channelsReady: PropTypes.bool,
  brandsReady: PropTypes.bool,
  tagsReady: PropTypes.bool,
};

class Sidebar extends React.Component {
  static renderChannel(channel) {
    const onClick = () => {
      Wrapper.Sidebar.filter('channelId', channel._id);
    };

    return (
      <li key={channel._id}>
        <a
          className={Wrapper.Sidebar.getActiveClass('channelId', channel._id)}
          onClick={onClick}
        >

          <span className="icon">#</span>{channel.name}
          <span className="counter">
            {Counts.get(`conversations.counts.byChannel${channel._id}`)}
          </span>
        </a>
      </li>
    );
  }

  static renderBrand(brand) {
    const onClick = () => {
      Wrapper.Sidebar.filter('brandId', brand._id);
    };

    return (
      <li key={brand._id}>
        <a
          className={Wrapper.Sidebar.getActiveClass('brandId', brand._id)}
          onClick={onClick}
        >

          <span className="icon">#</span>{brand.name}
          <span className="counter">
            {Counts.get(`conversations.counts.byBrand${brand._id}`)}
          </span>
        </a>
      </li>
    );
  }

  static renderIntegration(integrationType, index) {
    const onClick = () => {
      Wrapper.Sidebar.filter('integrationType', integrationType);
    };

    return (
      <li key={index}>
        <a
          className={Wrapper.Sidebar.getActiveClass('integrationType', integrationType)}
          onClick={onClick}
        >

          <span className="icon">#</span>{integrationType}
          <span className="counter">
            {Counts.get(`conversations.counts.byIntegrationType${integrationType}`)}
          </span>
        </a>
      </li>
    );
  }

  static renderTag(tag) {
    const onClick = () => {
      Wrapper.Sidebar.filter('tagId', tag._id);
    };

    return (
      <li key={tag._id}>
        <a
          className={Wrapper.Sidebar.getActiveClass('tagId', tag._id)}
          onClick={onClick}
        >

          <i className="ion-pricetag icon" style={{ color: tag.colorCode }} />
          {tag.name}
          <span className="counter">
            {Counts.get(`conversations.counts.byTag${tag._id}`)}
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
  static renderSingleFilter(queryParamName, queryParamValue, countName, text) {
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
            {Counts.get(`conversations.counts.${countName}`)}
          </span>
        </a>
      </li>
    );
  }

  static renderSectionHeader(queryParamName, otherButton) {
    const onClick = () => {
      Wrapper.Sidebar.filter(queryParamName, '');
    };

    return (
      <Wrapper.Sidebar.Section.QuickButtons>
        {otherButton}
        {
          FlowRouter.getQueryParam(queryParamName)
            ? <a href="" className="quick-button" onClick={onClick}>
              <i className="ion-close-circled" />
            </a>
            : null
        }
      </Wrapper.Sidebar.Section.QuickButtons>
    );
  }

  static renderFilterSectionHeader() {
    return (
      <Wrapper.Sidebar.Section.QuickButtons>
        {
          FlowRouter.getQueryParam('participating') ||
          FlowRouter.getQueryParam('unassigned') ||
          FlowRouter.getQueryParam('status') ||
          FlowRouter.getQueryParam('starred')
            ? <a href="" className="quick-button" onClick={Sidebar.clearStatusFilter}>
              <i className="ion-close-circled" />
            </a>
            : null
        }
      </Wrapper.Sidebar.Section.QuickButtons>
    );
  }

  static renderEmptyState(list, text, iconClassName, isReady) {
    if (list.length === 0 && isReady) {
      return (
        <EmptyState
          icon={<i className={iconClassName} />}
          text={text}
          size="small"
        />
      );
    }

    if (list.length === 0 && !isReady) {
      return <LoadingSidebar.Lines />;
    }

    return null;
  }

  render() {
    const { channels, tags, brands, channelsReady, tagsReady, brandsReady } = this.props;
    const integrationTypes = INTEGRATIONS_TYPES.ALL_LIST;
    const { Title } = Wrapper.Sidebar.Section;
    const manageTags = (
      <a
        href={FlowRouter.path('tags/list', { type: 'conversation' })}
        className="quick-button"
      >
        <i className="ion-gear-a" />
      </a>
    );

    return (
      <Wrapper.Sidebar>
        <Wrapper.Sidebar.Section collapsible={channels.length > 5}>
          <Title>Channels</Title>
          {Sidebar.renderSectionHeader('channelId')}
          <ul className="filters">
            {channels.map(channel => Sidebar.renderChannel(channel))}
            {Sidebar.renderEmptyState(channels, 'No channel', 'ion-pound', channelsReady)}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section collapsible={brands.length > 5}>
          <Title>Brands</Title>
          {Sidebar.renderSectionHeader('brandId')}
          <ul className="filters">
            {brands.map(brand => Sidebar.renderBrand(brand))}
            {Sidebar.renderEmptyState(brands, 'No brand', 'ion-flag', brandsReady)}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section collapsible={integrationTypes.length > 5}>
          <Title>Integrations</Title>
          {Sidebar.renderSectionHeader('integrationType')}
          <ul className="filters">
            {integrationTypes.map((t, i) => Sidebar.renderIntegration(t, i))}
            {Sidebar.renderEmptyState(integrationTypes, 'No integration', 'ion-flag')}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section>
          <Title>Filter by status</Title>
          {Sidebar.renderFilterSectionHeader()}
          <ul className="filters">
            {Sidebar.renderSingleFilter(
              'unassigned', 'true', 'unassiged', 'Unassigned')}

            {Sidebar.renderSingleFilter(
              'participating', 'true',
              'participating', 'Participating')}

            {Sidebar.renderSingleFilter(
              'status', CONVERSATION_STATUSES.CLOSED, 'resolved', 'Resolved')}

            {Sidebar.renderSingleFilter('starred', 'true', 'starred', 'Starred')}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section collapsible={tags.length > 5}>
          <Title>Filter by tags</Title>
          {Sidebar.renderSectionHeader('tagId', manageTags)}

          <ul className="filters">
            {tags.map(tag => Sidebar.renderTag(tag))}
            {Sidebar.renderEmptyState(tags, 'No tags', 'ion-pricetag', tagsReady)}
          </ul>
        </Wrapper.Sidebar.Section>
      </Wrapper.Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
