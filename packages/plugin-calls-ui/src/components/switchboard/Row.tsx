import { Button, Icon, ModalTrigger, Tip } from '@erxes/ui/src/components';
import { MemberAvatars } from '@erxes/ui/src/components/';
import { FlexCenter } from '@erxes/ui/src/styles/main';
import React from 'react';
// import { IMeeting } from '../../types';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
// import Form from '../../containers/myCalendar/meeting/Form';
import { useNavigate } from 'react-router-dom';
type Props = {
  callList: any;
  //   remove: () => void;
};
export const Row = (props: Props) => {
  const { callList,  } = props;
  const navigate = useNavigate();


  return (
    <tr style={{ textAlign: 'left' }}>
      <td>{callList.status}</td>
      <td>{callList.caller || ''}</td>
      <td>{callList.callee}</td>
      <td>{callList.position}</td>
      <td>{callList.waitTime ? callList.waitTime : callList.talkTime}</td>
      <td>{callList.options}</td>
    </tr>
  );
};
