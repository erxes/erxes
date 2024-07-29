import React from "react";
import { IGrantRequest } from "../../common/type";
import { Button, FormControl, Icon, Label, ModalTrigger } from "@erxes/ui/src";
import { LinkButton } from "@erxes/ui/src/styles/main";
import Assignees from "@erxes/ui-sales/src/boards/components/Assignees";
import Form from "../containers/Form";
import moment from "moment";

type Props = {
  request: IGrantRequest;
  selecteRequests: string[];
  onChange: (id: string) => void;
};

const Row: React.FC<Props> = props => {
  const { request, selecteRequests, onChange } = props;

  const lblStyle = () => {
    switch (request.status) {
      case "approved":
        return "success";
      case "declined":
        return "danger";
      default:
        return "default";
    }
  };

  const { _id, contentType, detail, requester, users, createdAt, resolvedAt } =
    request;

  const trigger = (
    <Button btnStyle="link">
      <Icon icon="file-search-alt" />{" "}
    </Button>
  );

  const content = props => {
    const updatedProps = {
      ...props,
      _id
    };
    return <Form {...updatedProps} />;
  };

  const detailBtn = () => (
    <ModalTrigger
      title="Request Detail"
      trigger={trigger}
      content={content}
      size="lg"
    />
  );

  const onClick = e => {
    e.stopPropagation();
  };

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={selecteRequests.includes(_id)}
          componentclass="checkbox"
          onChange={() => onChange(_id)}
        />
      </td>
      <td>{contentType}</td>
      <td>{detail?.name}</td>
      <td>
        <LinkButton>{requester?.email || "-"}</LinkButton>
      </td>
      <td>
        <Assignees users={users || []} limit={5} />
      </td>
      <td>
        <Label lblStyle={lblStyle()}>{request.status}</Label>
      </td>
      <td>{createdAt ? moment(createdAt).format("ll hh:mm") : "-"}</td>
      <td>{resolvedAt ? moment(resolvedAt).format("ll hh:mm") : "-"}</td>
      <td>{detailBtn()}</td>
    </tr>
  );
};

export default Row;
