import {
  IIntegration,
  IntegrationMutationVariables,
} from "@erxes/ui-inbox/src/settings/integrations/types";
import React, { useState } from "react";

import { Count } from "@erxes/ui/src/styles/main";
import { EMPTY_CONTENT_MESSENGER } from "@erxes/ui-settings/src/constants";
import EmptyContent from "@erxes/ui/src/components/empty/EmptyContent";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import { INTEGRATION_KINDS } from "@erxes/ui/src/constants/integrations";
import IntegrationListItem from "./IntegrationListItem";
import Table from "@erxes/ui/src/components/table";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  integrations: IIntegration[];
  removeIntegration: (integration: IIntegration, callback?: any) => void;
  archive: (id: string, status: boolean) => void;
  repair: (id: string, kind: string) => void;
  kind?: string | null;
  editIntegration: (
    id: string,
    { name, brandId, channelIds, details }: IntegrationMutationVariables,
    callback: () => void
  ) => void;
  queryParams: any;
  disableAction?: boolean;
  integrationsCount: number;
};

const IntegrationList: React.FC<Props> = ({
  integrations,
  removeIntegration,
  archive,
  repair,
  kind,
  editIntegration,
  queryParams,
  disableAction,
  integrationsCount,
}) => {
  const [showExternalInfo, setShowExternalInfo] = useState<boolean>(false);

  const renderRows = () => {
    const { _id } = queryParams;

    const showExternalInfoColumn = () => {
      setShowExternalInfo(true);
    };

    return integrations.map((integration) => (
      <IntegrationListItem
        key={integration._id}
        _id={_id}
        integration={integration}
        removeIntegration={removeIntegration}
        archive={archive}
        repair={repair}
        disableAction={disableAction}
        editIntegration={editIntegration}
        showExternalInfoColumn={showExternalInfoColumn}
        showExternalInfo={showExternalInfo}
      />
    ));
  };

  if (!integrations || integrations.length < 1) {
    if (kind === INTEGRATION_KINDS.MESSENGER) {
      return <EmptyContent content={EMPTY_CONTENT_MESSENGER} />;
    }

    return (
      <EmptyState
        text="Start adding integrations now!"
        image="/images/actions/2.svg"
      />
    );
  }

  return (
    <>
      <Count>
        {integrationsCount} {kind} integration{integrationsCount > 1 && "s"}
      </Count>
      <Table>
        <thead>
          <tr>
            <th>{__("Name")}</th>
            <th>{__("Kind")}</th>
            <th>{__("Brand")}</th>
            <th>{__("Status")}</th>
            <th>{__("Health status")}</th>
            {showExternalInfo && <th>{__("External info")}</th>}
            <th style={{ width: 130 }}>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </Table>
    </>
  );
};

export default IntegrationList;
