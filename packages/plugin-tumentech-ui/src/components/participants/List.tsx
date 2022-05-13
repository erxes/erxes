import Table from '@erxes/ui/src/components/table';
import React from 'react';
import Row from './Row';
import { IParticipant } from '../../types';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  participants: IParticipant[];
};

class List extends React.Component<Props, {}> {
  renderRow() {
    const { participants } = this.props;

    return participants.map(participant => (
      <Row key={participant._id} participant={participant} />
    ));
  }

  render() {
    // const content = (
    //   <Table whiteSpace="nowrap" hover={true}>
    //     <thead>
    //       <tr>
    //         <th>{__("Participant")}</th>
    //         <th>{__("status")}</th>
    //         <th>{__("price offer")}</th>
    //         <th>{__("Actions")}</th>
    //       </tr>
    //     </thead>
    //     <tbody>{this.renderRow()}</tbody>
    //   </Table>
    // );

    return (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>{__('Participant')}</th>
            <th>{__('status')}</th>
            <th>{__('price offer')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );
  }
}

export default List;
