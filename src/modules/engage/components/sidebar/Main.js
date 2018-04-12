import React from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { router } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { MESSAGE_KIND_FILTERS } from '../../constants';

function Main({ counts, history }, { __ }) {
  const { Section } = Wrapper.Sidebar;

  return (
    <Section>
      <Section.Title>{__('Kind')}</Section.Title>

      <SidebarList>
        <li>
          <Link to="/engage">
            {__('All')}
            <SidebarCounter>{counts.all}</SidebarCounter>
          </Link>
        </li>

        {MESSAGE_KIND_FILTERS.map((kind, index) => (
          <li key={index}>
            <Link
              tabIndex={0}
              className={
                router.getParam(history, 'kind') === kind.name ? 'active' : ''
              }
              to={`/engage?kind=${kind.name}`}
            >
              {__(kind.text)}
              <SidebarCounter>{counts[kind.name]}</SidebarCounter>
            </Link>
          </li>
        ))}
      </SidebarList>
    </Section>
  );
}

Main.propTypes = {
  counts: PropTypes.object,
  history: PropTypes.object
};

Main.contextTypes = {
  __: PropTypes.func
};

export default withRouter(Main);
