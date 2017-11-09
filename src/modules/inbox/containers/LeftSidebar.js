import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { TAG_TYPES } from 'modules/tags/constants';
import { LeftSidebar as LeftSidebarComponent } from '../components';
import { queries } from '../graphql';

const LeftSidebar = props => {
  const { channelsQuery, brandsQuery, tagsQuery } = props;

  if (channelsQuery.loading) {
    return false;
  }

  // =============== actions
  const filter = () => {};

  const channels = channelsQuery.channels || [];
  const brands = brandsQuery.brands || [];
  const tags = tagsQuery.tags || [];

  const generatedChannels = channels.map(({ name, _id }) => ({
    _id: _id,
    title: name
  }));

  const generatedBrands = brands.map(({ name, _id }) => ({
    _id: _id,
    title: name
  }));

  const generatedTags = tags.map(({ name, _id, colorCode }) => ({
    _id: _id,
    title: name,
    iconColor: colorCode,
    iconClass: 'ion-pricetag'
  }));

  const updatedProps = {
    ...props,
    generatedChannels,
    generatedBrands,
    generatedTags,
    filter
  };

  return <LeftSidebarComponent {...updatedProps} />;
};

LeftSidebar.propTypes = {
  channelsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  tagsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.channels), {
    name: 'channelsQuery',
    options: ({ queryParams }) => {
      return {
        variables: { params: queryParams }
      };
    }
  }),
  graphql(gql(queries.brandList), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.tagList), {
    name: 'tagsQuery',
    options: () => {
      return {
        variables: {
          type: TAG_TYPES.CONVERSATION
        },
        fetchPolicy: 'network-only'
      };
    }
  })
)(LeftSidebar);
