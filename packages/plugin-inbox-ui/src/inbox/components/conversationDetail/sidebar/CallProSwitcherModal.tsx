import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import styled from "styled-components";
import { IConversation } from "@erxes/ui-inbox/src/inbox/types";
import { ICustomer } from "@erxes/ui-contacts/src/customers/types";
import { mutations, queries } from "@erxes/ui-inbox/src/inbox/graphql";
import { Icon, NameCard, Spinner } from "@erxes/ui/src";
import Button from "@erxes/ui/src/components/Button";
import { colors } from "@erxes/ui/src/styles";
import { __ } from "coreui/utils";

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
`;

const Row = styled.div<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid
    ${({ isSelected }) =>
      isSelected ? colors.colorPrimary : colors.colorShadowGray};
  background: ${({ isSelected }) => (isSelected ? "#f0f4ff" : colors.colorWhite)};
`;

const Name = styled.span`
  flex: 1;
  font-size: 13px;
  font-weight: 500;
`;

const CurrentBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${colors.colorPrimary};
  display: flex;
  align-items: center;
  gap: 3px;
`;

const Empty = styled.p`
  font-size: 13px;
  color: ${colors.colorCoreGray};
  text-align: center;
  padding: 16px 0;
`;

type Candidate = {
  _id: string;
  firstName?: string;
  lastName?: string;
  primaryPhone?: string;
  avatar?: string;
};

type Props = {
  conversation: IConversation;
  customer: ICustomer;
  closeModal?: () => void;
};

const CUSTOMERS_BY_IDS = gql`
  query customers($ids: [String]) {
    customers(ids: $ids) {
      _id
      firstName
      lastName
      primaryPhone
      avatar
    }
  }
`;

const CallProSwitcherModal: React.FC<Props> = ({
  conversation,
  customer,
  closeModal,
}) => {
  const {
    _id: conversationId,
    customerId,
    callProPotentialCustomerIds = [],
  } = conversation;

  const useIds = callProPotentialCustomerIds.length > 1;
  const phone = customer.primaryPhone || "";

  const [selectCustomer, { loading: selecting }] = useMutation(
    gql(mutations.callProCustomerSelect),
    { refetchQueries: ["conversationDetail"] },
  );

  const byIds = useQuery(CUSTOMERS_BY_IDS, {
    variables: { ids: callProPotentialCustomerIds },
    skip: !useIds,
    fetchPolicy: "network-only",
  });

  const byPhone = useQuery(gql(queries.callProCustomersByPhone), {
    variables: { phone },
    skip: useIds || !phone,
    fetchPolicy: "network-only",
  });

  const loading = useIds ? byIds.loading : byPhone.loading;
  const candidates: Candidate[] = useIds
    ? byIds.data?.customers || []
    : byPhone.data?.callProCustomersByPhone || [];

  if (loading) return <Spinner />;

  const candidateName = (c: Candidate) =>
    [c.firstName, c.lastName].filter(Boolean).join(" ") ||
    c.primaryPhone ||
    c._id;

  const handleSelect = (id: string) => {
    selectCustomer({ variables: { conversationId, customerId: id } }).then(
      () => closeModal && closeModal(),
    );
  };

  if (candidates.length === 0) {
    return <Empty>{__("No customers found for this phone number.")}</Empty>;
  }

  return (
    <List>
      {candidates.map((c) => {
        const isSelected = c._id === customerId;
        return (
          <Row key={c._id} isSelected={isSelected}>
            <NameCard.Avatar customer={c} size={32} />
            <Name>{candidateName(c)}</Name>
            {isSelected ? (
              <CurrentBadge>
                <Icon icon="check-circle" style={{ fontSize: 13 }} />
                {__("Current")}
              </CurrentBadge>
            ) : (
              <Button
                btnStyle="primary"
                size="small"
                disabled={selecting}
                onClick={() => handleSelect(c._id)}
              >
                {__("Select")}
              </Button>
            )}
          </Row>
        );
      })}
    </List>
  );
};

export default CallProSwitcherModal;
