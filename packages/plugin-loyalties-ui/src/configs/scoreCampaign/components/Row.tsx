import {
  ActionButtons,
  Button,
  FormControl,
  ModalTrigger
} from "@erxes/ui/src";
import React from "react";
import { IScoreCampaign } from "../types";
import Form from "./Form";

type Props = {
  campaign: IScoreCampaign;
  isChecked: boolean;
  toggleBulk: (_id: string, isChecked: boolean) => void;
  refetch: () => void;
};

export default function Row({
  toggleBulk,
  campaign,
  isChecked,
  refetch
}: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(campaign._id, e.target.checked);
    }
  };

  return (
    <tr>
      <td onClick={(e) => e.stopPropagation()}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{campaign.title}</td>
      <td>{campaign.ownerType}</td>
      <td>{campaign.status}</td>
      <td>
        <ActionButtons>
          <ModalTrigger
            title="Edit score campaign"
            content={({ closeModal }) => (
              <Form
                closeModal={closeModal}
                campaign={campaign}
                refetch={refetch}
              />
            )}
            trigger={<Button icon="edit-3" btnStyle="link" />}
          />
        </ActionButtons>
      </td>
    </tr>
  );
}
