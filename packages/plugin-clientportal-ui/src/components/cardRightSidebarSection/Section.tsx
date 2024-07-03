import { IClientPortalParticipant } from "../../types";
import Box from "@erxes/ui/src/components/Box";
import ClientPortalParticipantForm from "../../containers/ClientPortalParticipantForm";
import ClientUserChooser from "../../containers/ClientUserChooser";
import Detail from "./Detail";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import Icon from "@erxes/ui/src/components/Icon";
import { ItemContainer } from "@erxes/ui-cards/src/boards/styles/common";
import { Link } from "react-router-dom";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { ParticipantsWrapper } from "../../styles";
import React from "react";

export type Props = {
  participants: IClientPortalParticipant[];
  kind: "client" | "vendor";
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
  const renderForm = (formProps, participant) => {
    return (
      <ClientPortalParticipantForm
        mainType={mainType}
        mainTypeId={mainTypeId}
        {...formProps}
        queryParams={{}}
        kind={kind}
        clientPortalUser={participant.cpUser}
      />
    );
  };

  const renderBody = () => {
    if (!participants || !participants.length) {
      return <EmptyState icon="user-6" text="No data" />;
    }

    return (
      <>
        {participants.map((participant) => (
          <React.Fragment key={participant._id}>
            <ModalTrigger
              title={`User Card detail`}
              trigger={
                <ParticipantsWrapper>
                  <ItemContainer>
                    {/* <Detail color='#F7CE53' item={participant.cpUser} /> */}
                    <Detail color="#b49cf1" item={participant?.cpUser} />
                    <Detail
                      color="#EA475D"
                      item={participant?.cpUser?.company}
                    />
                    <Link
                      to={`/settings/client-portal/users/details/${participant.cpUserId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {participant.status}
                    </Link>
                  </ItemContainer>
                </ParticipantsWrapper>
              }
              autoOpenKey="showCardClientUserModal"
              content={(formProps) => renderForm(formProps, participant)}
              size={"lg"}
            />
          </React.Fragment>
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
