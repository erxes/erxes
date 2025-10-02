import { useQuery } from "@apollo/client";
import PortableChooser from "@erxes/ui-sales/src/deals/components/PortableChooser";
import { FlexRow } from "@erxes/ui-settings/src/styles";
import { Button, Icon } from "@erxes/ui/src";
import Spinner from "@erxes/ui/src/components/Spinner";
import { IFormProps } from "@erxes/ui/src/types";
import gql from "graphql-tag";
import React, { useEffect, useState } from "react";
import styledTS from "styled-components";
import { OwnerBox } from "../../../styles";
import queries from "../graphql/queries";

const OwnerBoxWrapper = styledTS<
  React.PropsWithChildren<{
    $isSelected?: boolean;
    $hasSelection?: boolean;
    isWithActions?: boolean;
  }>
>(OwnerBox)`
  overflow: hidden;

  flex: ${({ $isSelected, $hasSelection }) =>
    $hasSelection && !$isSelected ? "0 1 auto" : "1"} !important;

  > span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    display: ${({ $isSelected, $hasSelection }) =>
      $isSelected || !$hasSelection ? "inline" : "none"};
  }

  > button {
    padding: 0;
  }

  ${({ isWithActions }) =>
    isWithActions
      ? `
      > *:last-child {
      margin-left: auto;
    }
    `
      : ``}
`;

type Props = {
  formProps: IFormProps;
  ownerId: string;
  ownerType: string;
  onChange: (targetId: string, serviceName: string) => void;
};

const TargetChooser = ({ formProps, ownerId, ownerType, onChange }: Props) => {
  const [state, setState] = useState<any>({
    currentTarget: {},
    selectedTarget: {},
    ownerId: ownerId,
    ownerType: ownerType,
  });

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      ownerId,
      ownerType,
    }));
  }, [ownerId, ownerType]);

  const { data, loading } = useQuery(gql(queries.GET_SERVICES_QUERY));

  if (loading) {
    return <Spinner />;
  }

  const { scoreCampaignServices = [] } = data || {};

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation();

    setState((prev) => ({
      ...prev,
      currentTarget: {},
      selectedTarget: {},
    }));
  };

  const renderBox = (serviceConfig: any) => {
    const selectedItem = state.selectedTarget || {};
    const hasSelection = !!(selectedItem.name || selectedItem.number);
    const isSelected = serviceConfig.name === state.currentTarget?.name;

    return (
      <OwnerBoxWrapper
        key={serviceConfig?.name}
        $isSelected={isSelected}
        $hasSelection={hasSelection}
        isWithActions={hasSelection}
      >
        <Icon icon={serviceConfig?.icon || "question-circle"} size={16} />

        {!selectedItem.name && !selectedItem.number && (
          <span>{serviceConfig?.label || "-"}</span>
        )}

        {(selectedItem.name || selectedItem.number) && isSelected && (
          <span>{selectedItem.name || selectedItem.number}</span>
        )}

        {isSelected && hasSelection && (
          <Button btnStyle="link" icon="times" onClick={handleRemove} />
        )}
      </OwnerBoxWrapper>
    );
  };

  const renderContent = (serviceConfig: any) => {
    if (serviceConfig.name === "sales") {
      return (
        <PortableChooser
          mainType={state.ownerType}
          mainTypeId={state.ownerId}
          mainTypeName={"Target"}
          trigger={renderBox(serviceConfig)}
          onChoose={(item) => {
            setState((prev) => ({
              ...prev,
              currentTarget: serviceConfig,
              selectedTarget: item,
            }));

            onChange(item._id, serviceConfig.name);
          }}
        />
      );
    }

    if (serviceConfig.name === "pos") {
      return renderBox(serviceConfig);
    }
  };

  return (
    <FlexRow>
      {scoreCampaignServices.map((serviceConfig: any) =>
        renderContent(serviceConfig)
      )}
    </FlexRow>
  );
};

export default TargetChooser;
