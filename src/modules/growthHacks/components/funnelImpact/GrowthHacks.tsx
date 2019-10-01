import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import { FunnelContent } from 'modules/growthHacks/styles';
import { IGrowthHack } from 'modules/growthHacks/types';
import React from 'react';

type Props = {
  queryParams: any;
  growthHacks: IGrowthHack[];
};
class GrowthHacks extends React.Component<Props> {
  render() {
    const { growthHacks } = this.props;
    return (
      <FunnelContent>
        <Table hover={true}>
          <thead>
            <tr>
              <th>{__('Task name')}</th>
              <th>{__('Description')}</th>
              <th>{__('Task name')}</th>
              <th>{__('Task name')}</th>
              <th>{__('Task name')}</th>
            </tr>
          </thead>
          <tbody>
            {growthHacks.map(growthHack => (
              <tr key={growthHack._id}>
                <td>{growthHack.name}</td>
                <td>{growthHack.description}</td>
                <td>{growthHack.name}</td>
                <td>{growthHack.name}</td>
                <td>{growthHack.name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </FunnelContent>
    );
  }
}

export default GrowthHacks;
