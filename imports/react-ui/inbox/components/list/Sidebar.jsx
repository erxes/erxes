/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/href-no-hash */

import React, { PropTypes } from 'react';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { EmptyState } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';
import { KIND_CHOICES as INTEGRATIONS_TYPES } from '/imports/api/integrations/constants';

const propTypes = {
  channels: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
};

class Sidebar extends React.Component {
  static changeFilter(queryParamName, value) {
    FlowRouter.setQueryParams({ [queryParamName]: value });
  }

  static getActiveClass(queryParamName, value) {
    return FlowRouter.getQueryParam(queryParamName) === value ? 'active' : '';
  }

  static renderChannel(channel) {
    const onClick = () => {
      Sidebar.changeFilter('channelId', channel._id);
    };

    return (
      <li key={channel._id}>
        <a
          className={Sidebar.getActiveClass('channelId', channel._id)}
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
      Sidebar.changeFilter('brandId', brand._id);
    };

    return (
      <li key={brand._id}>
        <a
          className={Sidebar.getActiveClass('brandId', brand._id)}
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
      Sidebar.changeFilter('integrationType', integrationType);
    };

    return (
      <li key={index}>
        <a
          className={Sidebar.getActiveClass('integrationType', integrationType)}
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
      Sidebar.changeFilter('tagId', tag._id);
    };

    return (
      <li key={tag._id}>
        <a
          className={Sidebar.getActiveClass('tagId', tag._id)}
          onClick={onClick}
        >

          <i className="fa fa-tag icon" style={{ color: tag.colorCode }} />
          {tag.name}
          <span className="counter">
            {Counts.get(`conversations.counts.byTag${tag._id}`)}
          </span>
        </a>
      </li>
    );
  }

  static clearStatusFilter() {
    Sidebar.changeFilter('participating', '');
    Sidebar.changeFilter('status', '');
    Sidebar.changeFilter('unassigned', '');
    Sidebar.changeFilter('starred', '');
  }

  // unassigned, participatedUser, status, etc ...
  static renderSingleFilter(queryParamName, queryParamValue, countName, text) {
    const onClick = () => {
      // clear previous values
      Sidebar.clearStatusFilter();

      Sidebar.changeFilter(queryParamName, queryParamValue);
    };

    return (
      <li>
        <a
          className={Sidebar.getActiveClass(queryParamName, queryParamValue)}
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


  static renderSectionHeader(text, queryParamName) {
    const onClick = () => {
      Sidebar.changeFilter(queryParamName, '');
    };

    return (
      <h3>
        {text}
        <a href="" className="quick-button" onClick={onClick}>
          Clear
        </a>
      </h3>
    );
  }

  static renderEmptyState(list, text, iconClassName) {
    if (list.length === 0) {
      return (
        <EmptyState
          icon={<i className={iconClassName} />}
          text={text}
          size="small"
        />
      );
    }

    return null;
  }

  render() {
    const { channels, tags, brands } = this.props;
    const integrationTypes = INTEGRATIONS_TYPES.ALL_LIST;

    return (
      <Wrapper.Sidebar>
        <Wrapper.Sidebar.Section collapsible={channels.length > 5}>
          {Sidebar.renderSectionHeader('Channels', 'channelId')}
          <ul className="filters">
            {channels.map(channel => Sidebar.renderChannel(channel))}
            {Sidebar.renderEmptyState(channels, 'No channel', 'icon-pound')}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section collapsible={brands.length > 5}>
          {Sidebar.renderSectionHeader('Brands', 'brandId')}
          <ul className="filters">
            {brands.map(brand => Sidebar.renderBrand(brand))}
            {Sidebar.renderEmptyState(brands, 'No brand', 'icon-flag')}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section collapsible={integrationTypes.length > 5}>
          {Sidebar.renderSectionHeader('Integrations', 'integrationType')}
          <ul className="filters">
            {integrationTypes.map((t, i) => Sidebar.renderIntegration(t, i))}
            {Sidebar.renderEmptyState(integrationTypes, 'No integration', 'icon-flag')}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section>
          <h3>
            Filter by status
            <a onClick={Sidebar.clearStatusFilter} className="quick-button">
              Clear
            </a>
          </h3>
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
          {Sidebar.renderSectionHeader('Filter by tags', 'tagId')}

          <ul className="filters">
            {tags.map(tag => Sidebar.renderTag(tag))}
            {Sidebar.renderEmptyState(tags, 'No tags', 'icon-pricetag')}
          </ul>
        </Wrapper.Sidebar.Section>
      </Wrapper.Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
