import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { Icon, DataWithLoader } from 'modules/common/components';
import { router } from 'modules/common/utils';

FilterByParams.propTypes = {
  history: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  paramKey: PropTypes.string.isRequired,
  icon: PropTypes.string,
  loading: PropTypes.bool.isRequired
};

function FilterByParams({ history, fields, counts, paramKey, icon, loading }) {
  const data = (
    <SidebarList>
      {fields.map(field => (
        <li key={field._id}>
          <a
            tabIndex={0}
            className={
              router.getParam(history, [paramKey]) === field._id ? 'active' : ''
            }
            onClick={() => {
              router.setParams(history, { [paramKey]: field._id });
            }}
          >
            {icon ? (
              <Icon icon={icon} style={{ color: field.colorCode }} />
            ) : null}{' '}
            {field.name}
            <SidebarCounter>{counts[field._id]}</SidebarCounter>
          </a>
        </li>
      ))}
    </SidebarList>
  );

  return (
    <DataWithLoader
      loading={loading}
      count={fields.length}
      data={data}
      emptyText="no tags"
      emptyIcon="pricetag"
      size="small"
      objective={true}
    />
  );
}

export default withRouter(FilterByParams);
