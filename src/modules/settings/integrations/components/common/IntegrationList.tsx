import EmptyState from 'modules/common/components/EmptyState';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IIntegration } from '../../types';
import IntegrationListItem from './IntegrationListItem';

type Props = {
  integrations: IIntegration[];
  removeIntegration: (integration: IIntegration, callback?: any) => void;
  archive: (id: string) => void;
  editIntegration: (
    id: string,
    { name, brandId }: { name: string; brandId: string }
  ) => void;
  queryParams: any;
};

class IntegrationList extends React.Component<Props> {
  renderRows() {
    const {
      integrations,
      removeIntegration,
      archive,
      editIntegration,
      queryParams: { _id }
    } = this.props;

    return integrations.map(i => (
      <IntegrationListItem
        key={i._id}
        _id={_id}
        integration={i}
        removeIntegration={removeIntegration}
        archive={archive}
        editIntegration={editIntegration}
      />
    ));
  }

  render() {
    const { integrations } = this.props;

    if (!integrations || integrations.length < 1) {
      return (
        <EmptyState
          text="Start adding integrations now!"
          image="/images/actions/2.svg"
        />
      );
    }

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Kind')}</th>
            <th>{__('Brand')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRows()}</tbody>
      </Table>
    );
  }
}

export default IntegrationList;
