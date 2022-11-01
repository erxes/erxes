
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { NotificationContent } from '../../../styles/main';

import { INotification } from '../../../types';

type Props = {
  notification: INotification;
//   remove: (_id: string) => void;
};

const Row = (props: Props) => {
  const { notification } = props;

//   const renderRemoveAction = () => {
//     const onClick = () => {
//       remove(place._id);
//     };

//     return (
//       <Tip text={__('Delete')} placement="top">
//         <Button
//           id="directionDelete"
//           btnStyle="link"
//           onClick={onClick}
//           icon="times-circle"
//         />
//       </Tip>
//     );
//   };

//   const formContent = props => <PlaceForm {...props} place={place} />;

  return (
    <li>
        <p>{notification.title || 'New notification'}</p>
        <NotificationContent 
            dangerouslySetInnerHTML={{ __html: notification.content || '' }}
        />
    </li>
  );
};

export default Row;
