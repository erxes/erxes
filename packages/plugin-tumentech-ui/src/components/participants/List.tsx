import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import { IParticipant } from '../../types';
import Row from './Row';

type Props = {
  participants: IParticipant[];
  onChangeParticipants: (participants: IParticipant[]) => void;
};

type State = {
  participants: IParticipant[];
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      participants: props.participants || []
    };
  }

  renderRow() {
    const participants = this.state.participants;

    const onChangeStatus = (selectedId: string, isChecked: boolean) => {
      const changed = participants.map(p => {
        if (p._id === selectedId) {
          return { ...p, status: p.status = isChecked ? 'won' : 'lost' };
        }

        return { ...p, status: 'lost' };
      });

      this.props.onChangeParticipants(changed);
      this.setState({ participants: changed });
    };

    return participants.map(participant => (
      <Row
        key={participant._id}
        participant={participant}
        onChangeStatus={onChangeStatus}
      />
    ));
  }

  render() {
    return (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>{__('Participant')}</th>
            <th>{__('Car')}</th>
            <th>{__('Route')}</th>
            <th>{__('Price offer')}</th>
            <th>{__('Status')}</th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );
  }
}

export default List;
