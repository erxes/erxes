import { ActionButtons, Header } from "@erxes/ui-settings/src/styles";
import { FieldStyle, SidebarList } from "@erxes/ui/src/layout/styles";
import { __, router } from "@erxes/ui/src/utils";

import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import GroupForm from "../../containers/permission/PermissionGroupForm";
import { IUserGroupDocument } from "../../types";
import Icon from "@erxes/ui/src/components/Icon";
import { Link } from "react-router-dom";
import LoadMore from "@erxes/ui/src/components/LoadMore";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import React, { useEffect } from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import { SidebarItem } from "../../styles";
import Tip from "@erxes/ui/src/components/Tip";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { useLocation, useNavigate } from "react-router-dom";

const { Section } = Wrapper.Sidebar;

interface IProps {
  queryParams?: any;
  objects: IUserGroupDocument[];
  remove?: (id: string) => void;
}

const GroupList = (props: IProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const { groupId } = props.queryParams;

    if (!groupId && objects.length > 0) {
      router.setParams(
        navigate,
        location,
        { groupId: objects[0]._id || null },
        true
      );
    }
  }, [props.objects, history, props.queryParams]);

  const renderFormTrigger = (
    trigger: React.ReactNode,
    object?: IUserGroupDocument
  ) => {
    const content = (props) => <GroupForm {...props} group={object} />;

    return (
      <ModalTrigger title={__("New Group")} trigger={trigger} content={content} />
    );
  };

  const isActive = (id: string) => {
    const { queryParams } = props;
    const currentGroup = queryParams.groupId || "";

    return currentGroup === id;
  };

  const renderEditAction = (object: IUserGroupDocument) => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__("Edit")} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return renderFormTrigger(trigger, object);
  };

  const renderRemoveAction = (object: IUserGroupDocument) => {
    const { remove } = props;

    return (
      <Button
        btnStyle="link"
        onClick={() => remove && remove(object._id || "")}
      >
        <Tip text={__("Remove")} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const renderObjects = (objects: IUserGroupDocument[]) => {
    return objects.map((object) => (
      <SidebarItem key={object._id} isActive={isActive(object._id || "")}>
        <Link to={`?groupId=${object._id}`}>
          <FieldStyle>{object.name}</FieldStyle>
        </Link>
        <ActionButtons>
          {renderEditAction(object)}
          {renderRemoveAction(object)}
        </ActionButtons>
      </SidebarItem>
    ));
  };

  const renderContent = () => {
    const { objects } = props;

    return (
      <SidebarList $noBackground={true} $noTextColor={true}>
        {renderObjects(objects)}
      </SidebarList>
    );
  };

  const renderSidebarHeader = () => {
    const trigger = (
      <Button
        id="permission-create-user-group"
        btnStyle="success"
        icon="plus-circle"
        block={true}
      >
        Create user group
      </Button>
    );

    return (
      <>
        <Header>{renderFormTrigger(trigger)}</Header>
        <Section.Title>{__("User groups")}</Section.Title>
      </>
    );
  };

  const { objects } = props;

  return (
    <Sidebar wide={true} header={renderSidebarHeader()} hasBorder={true}>
      <DataWithLoader
        data={renderContent()}
        loading={false}
        count={objects.length}
        emptyText={__("There is no group")}
        emptyImage="/images/actions/26.svg"
      />
      <LoadMore all={objects.length} loading={false} />
    </Sidebar>
  );
};

export default GroupList;
