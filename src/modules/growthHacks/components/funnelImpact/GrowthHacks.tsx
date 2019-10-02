import PriorityIndicator from 'modules/boards/components/editForm/PriorityIndicator';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import { GrowthRow, TableContainer } from 'modules/growthHacks/styles';
import { IGrowthHack } from 'modules/growthHacks/types';
import Participators from 'modules/inbox/components/conversationDetail/workarea/Participators';
import React from 'react';

type Props = {
  queryParams: any;
  growthHacks: IGrowthHack[];
};

class GrowthHacks extends React.Component<Props> {
  renderPriority(priority) {
    if (!priority) {
      return null;
    }

    return (
      <>
        <PriorityIndicator value={priority} /> {priority}{' '}
      </>
    );
  }

  renderRow = (growthHack: IGrowthHack) => {
    return (
      <GrowthRow key={growthHack._id}>
        <td>{growthHack.name}</td>
        <td>{growthHack.description}</td>
        <td>{growthHack.stage && growthHack.stage.name}</td>
        <td>{this.renderPriority(growthHack.priority)}</td>
        <td>
          <Participators
            participatedUsers={growthHack.assignedUsers}
            limit={5}
          />
        </td>
      </GrowthRow>
    );
  };

  render() {
    const { growthHacks } = this.props;

    if (growthHacks.length === 0) {
      return null;
    }

    return (
      <TableContainer>
        <Table hover={true}>
          <thead>
            <tr>
              <th>{__('Experiment name')}</th>
              <th>{__('Description')}</th>
              <th>{__('Stage')}</th>
              <th>{__('Priority')}</th>
              <th>{__('Assigned user')}</th>
            </tr>
          </thead>
          <tbody>
            {growthHacks.map(growthHack => this.renderRow(growthHack))}
          </tbody>
        </Table>
      </TableContainer>
    );
  }
}

export default GrowthHacks;
