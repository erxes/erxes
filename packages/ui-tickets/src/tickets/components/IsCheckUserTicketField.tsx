import { gql, useQuery } from "@apollo/client";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import React from "react";

type Props = {
  ticketId: string;
  isCheckUserTicket?: boolean;
  onToggleChange: (value: boolean) => void;
};

export const IsCheckUserTicketField = ({
  isCheckUserTicket,
  ...props
}: Props) => {
  if (isCheckUserTicket === null || isCheckUserTicket === undefined) {
    return null;
  }

  const updatedProps = { ...props, isCheckUserTicket };

  return <IsCheckUserTicketFieldLabel {...updatedProps} />;
};

const GET_IS_CHECK_USER_TICKET_FIELD_LABEL = gql`
  query GetIsCheckUserTicketFieldLabel($ticketId: String!) {
    getIsCheckUserTicketFieldLabel(ticketId: $ticketId)
  }
`;
const IsCheckUserTicketFieldLabel = ({
  isCheckUserTicket,
  ticketId,
  onToggleChange
}: Props) => {
  const { loading, data } = useQuery<{
    getIsCheckUserTicketFieldLabel: string;
    loading: boolean;
  }>(GET_IS_CHECK_USER_TICKET_FIELD_LABEL, {
    variables: { ticketId }
  });

  const label =
    data?.getIsCheckUserTicketFieldLabel ||
    `Show only the user's assigned(created) ticket`;

  return (
    <FormGroup controlId="isCheckUserTicket">
      <ControlLabel>{loading ? "Loading..." : label}</ControlLabel>
      <FormControl
        type="checkbox"
        componentclass="checkbox"
        checked={isCheckUserTicket}
        onChange={(e) => onToggleChange((e.target as HTMLInputElement).checked)}
      />
    </FormGroup>
  );
};
