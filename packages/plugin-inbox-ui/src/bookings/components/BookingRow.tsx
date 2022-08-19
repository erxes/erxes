import React from "react";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Label from "@erxes/ui/src/components/Label";
import { __ } from "coreui/utils";
import Tip from "@erxes/ui/src/components/Tip";
import Button from "@erxes/ui/src/components/Button";
import WithPermission from "coreui/withPermission";
import TextInfo from "@erxes/ui/src/components/TextInfo";
import { RowTitle } from "@erxes/ui-engage/src/styles";
import { Link } from "react-router-dom";
import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import { IBookingIntegration } from "../types";
import FormControl from "@erxes/ui/src/components/form/Control";
import Icon from "@erxes/ui/src/components/Icon";
import { Capitalize } from "@erxes/ui-settings/src/permissions/styles";
import dayjs from "dayjs";
import { DateWrapper } from "@erxes/ui/src/styles/main";
import Tags from "@erxes/ui/src/components/Tags";
import Manage from "./Manage";

type Props = {
  isChecked: boolean;
  integration: IBookingIntegration;
  toggleBulk: (integration: IBookingIntegration, checked: boolean) => void;
  remove: (integrationId: string) => void;
  refetch: () => void;
  archive: (_id: string, status: boolean) => void;
};

function Row({ isChecked, toggleBulk, integration, remove, archive }: Props) {
  const tags = integration.tags || [];
  const bookingData = integration.bookingData || {};
  const form = integration.form || ({} as any);

  const createdUser = form.createdUser || {
    _id: "",
    details: {
      fullName: "",
    },
  };

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(integration, e.target.checked);
    }
  };

  const manageAction = () => {
    return (
      <Link to={`/bookings/edit/${integration._id}`}>
        <Button id="skill-edit-skill" btnStyle="link">
          <Tip text={__("Manage")} placement="bottom">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      </Link>
    );
  };

  const renderRemoveAction = () => {
    const onClick = () => remove(integration._id);

    return (
      <WithPermission action="integrationsRemove">
        <Tip text={__("Delete")} placement="top">
          <Button
            id="integrationDelete"
            btnStyle="link"
            onClick={onClick}
            icon="times-circle"
          />
        </Tip>
      </WithPermission>
    );
  };

  const renderArchiveAction = () => {
    const onClick = () => archive(integration._id, true);

    if (!archive || !integration.isActive) {
      return null;
    }

    return (
      <WithPermission action="integrationsArchive">
        <Tip text={__("Archive")} placement="top">
          <Button btnStyle="link" onClick={onClick} icon="archive-alt" />
        </Tip>
      </WithPermission>
    );
  };

  const renderUnarchiveAction = () => {
    const onClick = () => archive(integration._id, false);

    if (!archive || integration.isActive) {
      return null;
    }

    return (
      <WithPermission action="integrationsArchive">
        <Tip text={__("Unarchive")} placement="top">
          <Button btnStyle="link" onClick={onClick} icon="redo" />
        </Tip>
      </WithPermission>
    );
  };

  const renderEditAction = () => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__("Install code")} placement="top">
          <Icon icon="code" />
        </Tip>
      </Button>
    );

    const content = (props) => <Manage integration={integration} {...props} />;

    return (
      <ModalTrigger
        title={`Install code of ${bookingData.name}`}
        size="lg"
        trigger={trigger}
        content={content}
        isAnimate={true}
      />
    );
  };

  const labelStyle = integration.isActive ? "success" : "warning";
  const status = integration.isActive ? __("Active") : __("Archived");

  return (
    <tr>
      <td>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>
        <RowTitle>
          <Link to={`/bookings/edit/${integration._id}`}>
            {integration.name}
          </Link>
        </RowTitle>
      </td>
      <td>
        <TextInfo>{integration.brand && integration.brand.name}</TextInfo>
      </td>

      <td>
        <TextInfo ignoreTrans={true}>{bookingData.viewCount || 0}</TextInfo>
      </td>
      <td>
        <Label lblStyle={labelStyle}>{status && status}</Label>
      </td>

      <td>
        <div>
          <Capitalize>
            {createdUser.details && createdUser.details.fullName}
          </Capitalize>
        </div>
      </td>
      <td>
        <Icon icon="calender" />{" "}
        <DateWrapper>{dayjs(form.createdDate).format("ll")}</DateWrapper>
      </td>

      <td>
        <Tags tags={tags} limit={2} />
      </td>

      <td>
        <ActionButtons>
          {manageAction()}
          {renderEditAction()}
          {renderArchiveAction()}
          {renderUnarchiveAction()}
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
}

export default Row;
