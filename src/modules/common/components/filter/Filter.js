import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router';
import gql from 'graphql-tag';
import { router } from 'modules/common/utils';
import { Chip } from 'modules/common/components';
import createChipText from './createChipText';

const propTypes = {
  history: PropTypes.object.isRequired,
  queryParams: PropTypes.object
};

const Filters = styled.div`
  font-size: 0.9em;
`;

function Filter({ queryParams = {}, history }) {
  const onClickClose = paramKey => {
    router.setParams(history, { [paramKey]: null });
  };

  const renderFilterParam = (paramKey, bool) => {
    if (queryParams[paramKey]) {
      return (
        <Chip onClickClose={() => onClickClose(paramKey)}>
          {bool ? paramKey : queryParams[paramKey]}
        </Chip>
      );
    }
  };

  const renderFilterWithData = (paramKey, type) => {
    if (queryParams[paramKey]) {
      const id = queryParams[paramKey];
      const graphqlQuery = gql`
          query ${type}Detail($id: String!) {
            ${type}Detail(_id: $id) {
              _id
              name
            }
          }
        `;

      const ChipText = createChipText(graphqlQuery, id);

      return (
        <Chip normal onClickClose={() => onClickClose(paramKey)}>
          <ChipText />
        </Chip>
      );
    }
  };

  return (
    <Filters>
      {renderFilterWithData('channelId', 'channel')}
      {renderFilterParam('status')}
      {renderFilterParam('participating', true)}
      {renderFilterParam('unassigned', true)}
      {renderFilterWithData('brandId', 'brand')}
      {renderFilterParam('integrationType')}
      {renderFilterWithData('tag', 'tag')}
      {renderFilterWithData('segment', 'segment')}
      {renderFilterParam('kind')}
      {renderFilterWithData('brand', 'brand')}
    </Filters>
  );
}

Filter.propTypes = propTypes;

export default withRouter(Filter);
