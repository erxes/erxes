import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { renderFullName } from '@erxes/ui/src/utils/core';
import React from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { IClientPortalParticipant, IClientPortalUser } from '../../types';
import Detail from './Detail';
import { ParticipantsWrapper } from '../../styles';
import { ItemContainer } from '@erxes/ui-cards/src/boards/styles/common';
import Icon from '@erxes/ui/src/components/Icon';
import ClientUserChooser from '../../containers/ClientUserChooser';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import ClientPortalParticipantForm from '../../containers/ClientPortalParticipantForm';
import { Link } from 'react-router-dom';

export type Props = {
  participants: IClientPortalParticipant[];
  kind: 'client' | 'vendor';
  mainType: string;
  mainTypeId: string;
  refetch: () => void;
};

export default function Component({
  participants,
  kind,
  mainType,
  mainTypeId,
  refetch,
}: Props) {
  const renderBody = () => {
    if (!participants || !participants.length) {
      return <EmptyState icon="user-6" text="No data" />;
    }

    return (
      <>
        {participants.map((participant, index) => (
          <ModalTrigger
            key={`${index}`}
            title={`User Card detail`}
            trigger={
              <ParticipantsWrapper key={index}>
                <ItemContainer key={index}>
                  {/* <Detail color='#F7CE53' item={participant.cpUser} /> */}
                  <Detail color="#b49cf1" item={participant.cpUser} />
                  <Detail color="#EA475D" item={participant.cpUser.company} />
                  <Link
                    key={index}
                    to={`/settings/client-portal/users/details/${participant.cpUserId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <a>{participant.status}</a>
                  </Link>
                </ItemContainer>
              </ParticipantsWrapper>
            }
            autoOpenKey="showCardClientUserModal"
            content={(props) => (
              <ClientPortalParticipantForm
                mainType={mainType}
                mainTypeId={mainTypeId}
                {...props}
                queryParams={{}}
                kind={kind}
                clientPortalUser={participant.cpUser}
              />
            )}
            size={'lg'}
          />
        ))}
      </>
    );
  };

  const manageContent = (props) => (
    <ClientUserChooser
      onSelect={() => {}}
      closeModal={props.closeModal}
      refetch={refetch}
      data={{
        users: participants.map((d) => d.cpUser),
        kind,
        mainType,
        mainTypeId,
      }}
    />
  );

  const extraButtons = (
    <ModalTrigger
      title="Manage"
      size="xl"
      trigger={
        <button>
          <Icon icon="edit-3" />
        </button>
      }
      content={manageContent}
    />
  );

  return (
    <Box
      title={`${kind}s`}
      extraButtons={[extraButtons]}
      isOpen={true}
      name="participants"
    >
      {renderBody()}
    </Box>
  );
}
