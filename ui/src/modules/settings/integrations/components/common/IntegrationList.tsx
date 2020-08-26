import EmptyContent from 'modules/common/components/empty/EmptyContent';
import EmptyState from 'modules/common/components/EmptyState';
import Table from 'modules/common/components/table';
import { Count } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { EMPTY_CONTENT_MESSENGER } from 'modules/settings/constants';
import React from 'react';
import { INTEGRATION_KINDS } from '../../constants';
import { IIntegration, IntegrationMutationVariables } from '../../types';
import IntegrationListItem from './IntegrationListItem';

type Props = {
  integrations: IIntegration[];
  removeIntegration: (integration: IIntegration, callback?: any) => void;
  archive: (id: string, status: boolean) => void;
  kind?: string | null;
  editIntegration: (
    id: string,
    { name, brandId, channelIds }: IntegrationMutationVariables
  ) => void;
  queryParams: any;
  disableAction?: boolean;
  integrationsCount: number;
};

class IntegrationList extends React.Component<Props> {
  renderRows() {
    const {
      integrations,
      removeIntegration,
      archive,
      editIntegration,
      queryParams: { _id },
      disableAction
    } = this.props;

    return integrations.map(i => (
      <IntegrationListItem
        key={i._id}
        _id={_id}
        integration={i}
        removeIntegration={removeIntegration}
        archive={archive}
        disableAction={disableAction}
        editIntegration={editIntegration}
      />
    ));
  }

  render() {
    const { integrations, kind, integrationsCount } = this.props;

    if (!integrations || integrations.length < 1) {
      if(kind === INTEGRATION_KINDS.MESSENGER) {
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
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRows()}</tbody>
        </Table>
      </>
    );
  }
}

export default IntegrationList;
