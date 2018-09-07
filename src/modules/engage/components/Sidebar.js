import * as React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { CountsByTag } from 'modules/common/components';
import { router } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { statusFilters, MESSAGE_KIND_FILTERS } from '../constants';

const { Section } = Wrapper.Sidebar;

class Sidebar extends React.Component {
  renderKindFilter() {
    const { __ } = this.context;
    const { kindCounts, history } = this.props;

    return (
      <Section>
        <Section.Title>{__('Kind')}</Section.Title>

        <SidebarList>
          <li>
            <Link to="/engage">
              {__('All')}
              <SidebarCounter>{kindCounts.all}</SidebarCounter>
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
                <SidebarCounter>{kindCounts[kind.name]}</SidebarCounter>
              </Link>
            </li>
          ))}
        </SidebarList>
      </Section>
    );
  }

  renderStatusFilter() {
    const { __ } = this.context;
    const { statusCounts, history } = this.props;

    return (
      <Section>
        <Section.Title>{__('Status')}</Section.Title>

        <SidebarList>
          {statusFilters.map((status, index) => (
            <li key={index}>
              <Link
                tabIndex={0}
                className={
                  router.getParam(history, 'status') === status.key
                    ? 'active'
                    : ''
                }
                to={`/engage?status=${status.key}`}
              >
                {__(status.value)}
                <SidebarCounter>{statusCounts[status.key]}</SidebarCounter>
              </Link>
            </li>
          ))}
        </SidebarList>
      </Section>
    );
  }

  render() {
    const { tags, tagCounts } = this.props;

    return (
      <Wrapper.Sidebar>
        {this.renderKindFilter()}
        {this.renderStatusFilter()}

        <CountsByTag
          tags={tags}
          manageUrl="tags/engageMessage"
          counts={tagCounts}
          loading={false}
        />
      </Wrapper.Sidebar>
    );
  }
}

Sidebar.propTypes = {
  kindCounts: PropTypes.object,
  statusCounts: PropTypes.object,
  tagCounts: PropTypes.object,
  tags: PropTypes.array,
  history: PropTypes.object
};

Sidebar.contextTypes = {
  __: PropTypes.func
};

export default Sidebar;
