import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Label from '@erxes/ui/src/components/Label';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import Tip from '@erxes/ui/src/components/Tip';
import React from 'react';
import { IParticipant } from '../../types';
import WithPermission from '@erxes/ui/src/components/WithPermission';
import { renderFullName } from '@erxes/ui/src/utils/core';
import Toggle from '@erxes/ui/src/components/Toggle';

type Props = {
  participant: IParticipant;
};

class Row extends React.Component<Props> {
  renderRemoveAction() {
    const { participant } = this.props;

    console.log('renderaction ', participant);

    const onChange = e => {
      console.log('e: ', e.target.checked);
    };

    // return (
    //   <WithPermission action="integrationsRemove">
    //     <Tip text={"Delete"} placement="top">
    //       <Button
    //         id="integrationDelete"
    //         btnStyle="link"
    //         onClick={onClick}
    //         icon="times-circle"
    //       />
    //     </Tip>
    //   </WithPermission>
    // );
    return (
      <div>
        <Toggle
          id="toggle"
          checked={false}
          onChange={onChange}
          icons={{
            checked: <span>Yes</span>,
            unchecked: <span>No</span>
          }}
        />
      </div>
    );
  }

  render() {
    const { participant } = this.props;
    const { customer } = participant;

    const labelStyle = participant.status === 'won' ? 'success' : 'warning';

    return (
      <tr>
        <td>
          <strong>{renderFullName(customer)}</strong>
        </td>
        <td>
          <Label lblStyle={labelStyle}>{participant.status}</Label>
        </td>
        <td>
          <TextInfo ignoreTrans={true}>
            {participant.detail.price || 0}
          </TextInfo>
        </td>
        <td>
          <ActionButtons>{this.renderRemoveAction()}</ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
