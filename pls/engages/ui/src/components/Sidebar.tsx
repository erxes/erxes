import CountsByTag from 'erxes-ui/lib/components/CountsByTag';
import { __, router } from 'erxes-ui/lib/utils';
import Wrapper from 'erxes-ui/lib/layout/components/Wrapper';
import { FieldStyle, SidebarCounter, SidebarList } from 'erxes-ui/lib/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { MESSAGE_KIND_FILTERS, statusFilters } from '../constants';

const { Section } = Wrapper.Sidebar;

type Props = {
  kindCounts: any;
  statusCounts: any;
  tagCounts: any;
  tags: any[];
  history?: any;
};

class Sidebar extends React.Component<Props> {
  renderKindFilter() {
    const { kindCounts, history } = this.props;

    return (
      <Section>
        <Section.Title>{__('Kind')}</Section.Title>

        <SidebarList>
          <li>
            <Link to="/campaigns">
              <FieldStyle>{__('All')}</FieldStyle>
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
                to={`/campaigns?kind=${kind.name}`}
              >
                <FieldStyle>{__(kind.text)}</FieldStyle>
                <SidebarCounter>{kindCounts[kind.name]}</SidebarCounter>
              </Link>
            </li>
          ))}
        </SidebarList>
      </Section>
    );
  }

  renderStatusFilter() {
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
                to={`/campaigns?status=${status.key}`}
              >
                <FieldStyle>{__(status.value)}</FieldStyle>
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

export default Sidebar;
