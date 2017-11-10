import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { SidebarList, SidebarCounter } from '../../layout/styles';
import { EmptyState, Icon } from 'modules/common/components';
import { router } from 'modules/common/utils';

FilterByParams.propTypes = {
  history: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  paramKey: PropTypes.string.isRequired,
  icon: PropTypes.string
};

function FilterByParams({ history, fields, counts, paramKey, icon }) {
  return (
    <SidebarList>
      {fields.length ? (
        fields.map(field => (
          <li key={field._id}>
            <a
              tabIndex={0}
              className={
                router.getParam(history, [paramKey]) === field._id
                  ? 'active'
                  : ''
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
        ))
      ) : (
        <EmptyState icon="pricetag" text="No items" size="small" />
      )}
    </SidebarList>
  );
}

export default withRouter(FilterByParams);
