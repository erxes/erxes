import {
  IIntegration,
  IntegrationMutationVariables
} from '@erxes/ui-inbox/src/settings/integrations/types';

import { Count } from '@erxes/ui/src/styles/main';
import { EMPTY_CONTENT_MESSENGER } from '@erxes/ui-settings/src/constants';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { INTEGRATION_KINDS } from '@erxes/ui/src/constants/integrations';
import IntegrationListItem from './IntegrationListItem';
import React from 'react';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  integrations: IIntegration[];
  removeIntegration: (integration: IIntegration, callback?: any) => void;
  archive: (id: string, status: boolean) => void;
  repair: (id: string) => void;
  kind?: string | null;
  editIntegration: (
    id: string,
    { name, brandId, channelIds }: IntegrationMutationVariables
  ) => void;
  queryParams: any;
  disableAction?: boolean;
  integrationsCount: number;
};

type State = {
  showExternalInfo: boolean;
};

class IntegrationList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { showExternalInfo: false };
  }

  renderRows() {
    const {
      integrations,
      removeIntegration,
      archive,
      editIntegration,
      queryParams: { _id },
      disableAction,
      repair
    } = this.props;

    const showExternalInfoColumn = () => {
      this.setState({ showExternalInfo: true });
    };

    return integrations.map(i => (
      <IntegrationListItem
        key={i._id}
        _id={_id}
        integration={i}
        removeIntegration={removeIntegration}
        archive={archive}
        repair={repair}
        disableAction={disableAction}
        editIntegration={editIntegration}
        showExternalInfoColumn={showExternalInfoColumn}
        showExternalInfo={this.state.showExternalInfo}
      />
    ));
  }

  render() {
    const { integrations, kind, integrationsCount } = this.props;

    if (!integrations || integrations.length < 1) {
      if (kind === INTEGRATION_KINDS.MESSENGER) {
        return <EmptyContent content={EMPTY_CONTENT_MESSENGER} />;
      }

      return (
        <EmptyState
          text="Start adding integrations now!"
          image="/images/actions/2.svg"
        />
      );
    }

    return (
      <>
        <Count>
          {integrationsCount} {kind} integration{integrationsCount > 1 && 's'}
        </Count>
        <Table>
          <thead>
            <tr>
              <th>{__('Name')}</th>
              <th>{__('Kind')}</th>
              <th>{__('Brand')}</th>
              <th>{__('Status')}</th>
              <th>{__('Health status')}</th>
              {this.state.showExternalInfo ? (
                <th>{__('External info')}</th>
              ) : null}
              <th style={{ width: 130 }}>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRows()}</tbody>
        </Table>
      </>
    );
  }
}

export default IntegrationList;
