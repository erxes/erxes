import {
  ActionButtons,
  Button,
  FormControl,
  ModalTrigger,
  Toggle
} from "@erxes/ui/src";
import React from "react";
import { IScoreCampaign } from "../types";
import Form from "./Form";
import { Badge } from "../../../styles";
// @ts-ignore
import WithPermission from "coreui/withPermission";

type Props = {
  campaign: IScoreCampaign;
  isChecked: boolean;
  toggleBulk: (target: any, isChecked: boolean) => void;
  refetch: () => void;
  onChangeStatus: (_id: string, status: "published" | "draft") => void;
};

const statuses = {
  draft: false,
  published: true
};

export default function Row({
  toggleBulk,
  campaign,
  isChecked,
  refetch,
  onChangeStatus
}: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(campaign, e.target.checked);
    }
  };

  const handleStatus = () => {
    const status = { published: "draft", draft: "published" }[campaign.status];

    if (status) {
      onChangeStatus(campaign._id, status);
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
      <td>
        <WithPermission
          action="manageLoyalties"
          fallbackComponent={<Badge>{campaign.status}</Badge>}
        >
          <Toggle checked={statuses[campaign.status]} onChange={handleStatus} />
        </WithPermission>
      </td>
      <td>
        <ActionButtons>
          <ModalTrigger
            size="lg"
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
