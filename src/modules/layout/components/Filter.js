import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router';
import { router } from 'modules/common/utils';
import { Chip } from 'modules/common/components';

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

  return (
    <Filters>
      {renderFilterParam('channelId')}
      {renderFilterParam('status')}
      {renderFilterParam('participating', true)}
      {renderFilterParam('unassigned', true)}
      {renderFilterParam('brandId')}
      {renderFilterParam('integrationType')}
      {renderFilterParam('tag')}
    </Filters>
  );
}

Filter.propTypes = propTypes;

export default withRouter(Filter);
