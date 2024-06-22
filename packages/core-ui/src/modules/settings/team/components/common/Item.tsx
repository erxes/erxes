import * as routerUtils from "@erxes/ui/src/utils/router";

import { ActionButtons } from "@erxes/ui-settings/src/styles";
import Button from "@erxes/ui/src/components/Button";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import React from "react";
import { SideList } from "../../styles";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "modules/common/utils";
import queryString from "query-string";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  item: any;
  deleteItem: (_id: string, callback: () => void) => void;
  refetch: () => void;
  title: string;
  renderForm: ({ closeModal }: { closeModal: () => void }) => React.ReactNode;
  icon?: string;
  level?: number;
  queryParamName: string;
};

function BlockItem({
  item,
  title,
  icon,
  queryParamName,
  refetch,
  deleteItem,
  renderForm,
  level,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const trigger = (
    <Button btnStyle="link">
      <Tip text={__("Edit")} placement="bottom">
        <Icon icon="edit" />
      </Tip>
    </Button>
  );

  const editButton = (
    <ModalTrigger
      content={({ closeModal }) => renderForm({ closeModal })}
      title={`Edit a ${title}`}
      trigger={trigger}
    />
  );

  const onClick = (_id) => {
    routerUtils.removeParams(navigate, location, "page");

    routerUtils.setParams(navigate, location, { [queryParamName]: _id });
  };

  const queryParams = queryString.parse(location.search);

  return (
    <SideList
      isActive={queryParams[queryParamName] === item._id}
      key={item._id}
      level={level}
    >
      <span onClick={() => onClick(item._id)}>
        {icon && <Icon icon={icon} />}
        {item.code} - {item.title} ({item.users.length})
      </span>
      <ActionButtons>
        {editButton}
        <Tip text="Delete" placement="bottom">
          <Button
            btnStyle="link"
            onClick={() => deleteItem(item._id, refetch)}
            icon="cancel-1"
          />
        </Tip>
      </ActionButtons>
    </SideList>
  );
}

export default BlockItem;
