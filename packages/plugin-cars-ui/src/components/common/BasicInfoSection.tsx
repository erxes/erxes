import { Action, Name } from "../../styles";
import {
  Alert,
  Button,
  DropdownToggle,
  Icon,
  MainStyleInfoWrapper as InfoWrapper,
  ModalTrigger,
  Sidebar,
  __,
  confirm,
} from "@erxes/ui/src";

import Attachment from "@erxes/ui/src/components/Attachment";
import CarForm from "../../containers/CarForm";
import DetailInfo from "./DetailInfo";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import { IAttachment } from "@erxes/ui/src/types";
import { ICar } from "../../types";
import React from "react";

type Props = {
  car: ICar;
  remove: () => void;
};

const { Section } = Sidebar;

const BasicInfoSection = (props: Props) => {
  const { car, remove } = props;

  const renderImage = (item?: IAttachment) => {
    if (!item) {
      return null;
    }

    return <Attachment attachment={item} />;
  };

  const renderAction = () => {
    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    const carForm = (props) => <CarForm {...props} car={car} />;

    const menuItems = [
      {
        title: "Edit basic info",
        trigger: <a href="#edit">{__("Edit")}</a>,
        content: carForm,
        additionalModalProps: { size: "lg" },
      },
    ];

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
          modalMenuItems={menuItems}
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

  return (
    <Sidebar.Section>
      <InfoWrapper>
        <Name>{car.plateNumber}</Name>

        {renderAction()}
      </InfoWrapper>

      {renderImage(car.attachment)}
      <Section>
        <DetailInfo car={car} />
      </Section>
    </Sidebar.Section>
  );
};

export default BasicInfoSection;
