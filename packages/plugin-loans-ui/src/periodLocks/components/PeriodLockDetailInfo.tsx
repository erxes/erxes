import dayjs from "dayjs";
import {
  Alert,
  Button,
  confirm,
  DropdownToggle,
  Icon,
  MainStyleInfoWrapper as InfoWrapper,
  ModalTrigger,
  Sidebar,
  SidebarList,
} from "@erxes/ui/src";
import { __ } from "coreui/utils";
import React from "react";
import Dropdown from "@erxes/ui/src/components/Dropdown";

import { Action, Name } from "../../contracts/styles";
import PeriodLockForm from "../containers/PeriodLockForm";
import { IPeriodLockDetail } from "../types";

type Props = {
  periodLock: IPeriodLockDetail;
  remove?: () => void;
};

const DetailInfo = (props: Props) => {
  const renderAction = () => {
    const { remove } = props;

    const onDelete = () =>
      confirm()
        .then(() => remove && remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    return (
      <Action>
        <Dropdown
          as={DropdownToggle}
          toggleComponent={
            <Button btnStyle="simple" size="medium">
              {__("Action")}
              <Icon icon="angle-down" />
            </Button>
          }
        >
          <li>
            <a href="#delete" onClick={onDelete}>
              {__("Delete")}
            </a>
          </li>
        </Dropdown>
      </Action>
    );
  };

  const { periodLock } = props;
  const { Section } = Sidebar;

  const content = (props) => (
    <PeriodLockForm {...props} periodLock={periodLock} />
  );

  return (
    <Sidebar wide={true}>
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{dayjs(periodLock.date).format("ll")}</Name>
          <ModalTrigger
            title={__("Edit basic info")}
            trigger={<Icon icon="edit" />}
            size="lg"
            content={content}
          />
        </InfoWrapper>

        {renderAction()}

        <Section>
          <SidebarList className="no-link"></SidebarList>
        </Section>
      </Sidebar.Section>
    </Sidebar>
  );
};

export default DetailInfo;
