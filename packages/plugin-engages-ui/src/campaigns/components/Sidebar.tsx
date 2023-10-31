import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import {
  MESSAGE_KIND_FILTERS,
  statusFilters
} from '@erxes/ui-engage/src/constants';
import { __, router } from 'coreui/utils';

import CountsByTag from '@erxes/ui/src/components/CountsByTag';
import { ITag } from '@erxes/ui-tags/src/types';
import { Link } from 'react-router-dom';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';

const { Section } = Wrapper.Sidebar;

type Props = {
  kindCounts: any;
  statusCounts: any;
  tagCounts: any;
  tags: ITag[];
  history?: any;
};

class Sidebar extends React.Component<Props> {
  renderKindFilter() {
    const { kindCounts, history } = this.props;

    return (
      <Section noShadow noMargin>
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
      <Section noShadow noMargin>
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
      <Wrapper.Sidebar hasBorder={true}>
        {this.renderKindFilter()}
        {this.renderStatusFilter()}

        {isEnabled('tags') && (
          <CountsByTag
            tags={tags}
            manageUrl="/settings/tags?type=engages:engageMessage"
            counts={tagCounts}
            loading={false}
          />
        )}
      </Wrapper.Sidebar>
    );
  }
}

export default Sidebar;
