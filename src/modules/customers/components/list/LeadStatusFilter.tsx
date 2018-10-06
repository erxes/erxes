import * as React from 'react';
import { withRouter } from 'react-router';

import { DataWithLoader, Icon } from 'modules/common/components';
import { __, router } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { IRouterProps } from '../../../common/types';
import { LEAD_STATUS_TYPES } from '../../constants';
import { leadStatusChoices } from '../../utils';

interface IProps extends IRouterProps {
  counts: any;
  loading: boolean;
  searchable?: boolean;
}

class LeadStatusFilter extends React.Component<IProps> {
  constructor(props, context) {
    super(props, context);

    this.renderCounts = this.renderCounts.bind(this);
  }

  renderCounts() {
    const { history, counts } = this.props;
    const { Section } = Wrapper.Sidebar;
    const paramKey = 'leadStatus';

    return (
      <Section collapsible={true}>
        <Section.Title>{__('Filter by lead status')}</Section.Title>
        <Section.QuickButtons>
          {router.getParam(history, 'leadStatus') ? (
            <a
              tabIndex={0}
              onClick={() => {
                router.setParams(history, { leadStatus: null });
              }}
            >
              <Icon icon="cancel-1" />
            </a>
          ) : null}
        </Section.QuickButtons>
        <div>
          <SidebarList>
            {leadStatusChoices(__).map(
              ({ value, label }: { value: string; label: string }) => {
                return (
                  <li key={Math.random()}>
                    <a
                      tabIndex={0}
                      className={
                        router.getParam(history, [paramKey]) === value
                          ? 'active'
                          : ''
                      }
                      onClick={() => {
                        router.setParams(history, { [paramKey]: value });
                      }}
                    >
                      {label}
                      <SidebarCounter>
                        {counts ? counts[value] : 0}
                      </SidebarCounter>
                    </a>
                  </li>
                );
              }
            )}
          </SidebarList>
        </div>
      </Section>
    );
  }

  render() {
    return (
      <DataWithLoader
        loading={this.props.loading}
        count={Object.keys(LEAD_STATUS_TYPES).length}
        data={this.renderCounts()}
        emptyText="No leads"
        emptyIcon="type"
        size="small"
        objective={true}
      />
    );
  }
}

export default withRouter<IProps>(LeadStatusFilter);
