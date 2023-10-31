import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import {
  FieldStyle,
  SectionBodyItem,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { renderFullName } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Link } from 'react-router-dom';

import { IClientPortalUser } from '../../types';
import Detail from './Detail';
import { ParticipantsWrapper } from '../../styles';
import { ItemContainer } from '@erxes/ui-cards/src/boards/styles/common';

export type Props = {
  users: IClientPortalUser[];
  kind: 'client' | 'vendor';
};

export default function Component({ users, kind }: Props) {
  const renderBody = () => {
    if (!users || !users.length) {
      return <EmptyState icon="user-6" text="No data" />;
    }

    return (
      <>
        {users.map((participant, index) => (
          <ParticipantsWrapper key={index}>
            <ItemContainer key={index}>
              <Link
                key={index}
                to={`/settings/client-portal/users/details/${participant._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Detail color="#F7CE53" item={participant.clientPortal} />
                <Detail color="#b49cf1" item={participant} />
                <Detail color="#EA475D" item={participant.company} />
              </Link>
            </ItemContainer>
          </ParticipantsWrapper>
        ))}
      </>
    );
  };

  //   const manageContent = props => (
  //     <ParticipantsForm
  //       participants={participants}
  //       renderButton={renderButton}
  //       closeModal={props.closeModal}
  //     />
  //   );

  //   const extraButtons = (
  //     <>
  //       {participants.length && (
  //         <ModalTrigger
  //           title="Manage"
  //           size="xl"
  //           trigger={
  //             <button>
  //               <Icon icon="edit-3" />
  //             </button>
  //           }
  //           content={manageContent}
  //         />
  //       )}
  //     </>
  //   );

  return (
    <Box title={`${kind}s`} extraButtons={[]} isOpen={true} name="participants">
      {renderBody()}
    </Box>
  );
}
