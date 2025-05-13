import { Box, Table } from "@erxes/ui/src";
import { __ } from "coreui/utils";
import React from "react";

import { ContractsTableWrapper, ScrollTableColls } from "../../styles";
import Icon from "@erxes/ui/src/components/Icon";
import confirm from "@erxes/ui/src/utils/confirmation/confirm";
import Alert from "@erxes/ui/src/utils/Alert";
import { IContractDoc } from "../../types";
import PolarisContainer from "../../containers/Polaris";

type Props = {
  contract: IContractDoc;
  reSendCollateral: (contract: any) => void;
};

function CollateralSection({ contract, reSendCollateral }: Props) {
  const onSendCollateral = () =>
    confirm(__("Are you sure Send Collateral?"))
      .then(() => reSendCollateral(contract))
      .catch((error) => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    return (
      <button onClick={onSendCollateral} title="send collateral">
        <Icon icon="refresh-1" />
      </button>
    );
  };

  return (
    <Box
      title={__("Sync Collateral")}
      name="showPolaris"
      isOpen={true}
      extraButtons={renderExtraButton()}
    >
      <ScrollTableColls>
        <ContractsTableWrapper>
          <Table>
            <thead>
              <tr>
                <th>{__("Is Sync Collateral")}</th>
              </tr>
            </thead>

            {contract.isSyncedCollateral ? (
              <tbody id="schedules">
                <tr>
                  <td>{contract?.isSyncedCollateral && "Synced Collateral"}</td>
                </tr>
              </tbody>
            ) : (
              ""
            )}
          </Table>
        </ContractsTableWrapper>
      </ScrollTableColls>
    </Box>
  );
}

export default CollateralSection;
