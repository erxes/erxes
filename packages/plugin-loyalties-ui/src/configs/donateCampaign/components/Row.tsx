import {
  FormControl,
  Icon,
  ModalTrigger,
  TextInfo,
} from "@erxes/ui/src/components";

import Form from "../containers/Form";
import { IDonateCampaign } from "../types";
import { Link } from "react-router-dom";
import React from "react";

type Props = {
  donateCampaign: IDonateCampaign;
  isChecked: boolean;
  toggleBulk: (donateCampaign: IDonateCampaign, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  modalContent = (props) => {
    const { donateCampaign } = this.props;

    const updatedProps = {
      ...props,
      donateCampaign,
    };

    return <Form {...updatedProps} />;
  };

  render() {
    const { donateCampaign, toggleBulk, isChecked } = this.props;

    const onChange = (e) => {
      if (toggleBulk) {
        toggleBulk(donateCampaign, e.target.checked);
      }
    };

    const onClick = (e) => {
      e.stopPropagation();
    };

    const { _id, title, startDate, endDate, finishDateOfUse, status } =
      donateCampaign;

    const trigger = (
      <tr key={_id}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentclass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{title}</td>
        <td>{new Date(startDate).toLocaleDateString()}</td>
        <td>{new Date(endDate).toLocaleDateString()}</td>
        <td>{new Date(finishDateOfUse).toLocaleDateString()}</td>
        <td>
          <TextInfo>{status}</TextInfo>
        </td>
        <td onClick={onClick}>
          <Link to={`/donates?campaignId=${_id}`}>
            <Icon icon="list-2" />
          </Link>
        </td>
      </tr>
    );

    return (
      <ModalTrigger
        size={"lg"}
        title="Edit donate campaign"
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
      />
    );
  }
}

export default Row;
