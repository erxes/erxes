import {
  __,
  Alert,
  Button,
  confirm,
  DropdownToggle,
  Icon,
  MainStyleInfoWrapper as InfoWrapper,
  ModalTrigger,
  Sidebar,
} from "@erxes/ui/src";
import React from "react";
import Dropdown from "@erxes/ui/src/components/Dropdown";

import CarForm from "../../containers/CarForm";
import { Action, Name } from "../../styles";
import { ICar } from "../../types";
import DetailInfo from "./DetailInfo";
import { IAttachment } from "@erxes/ui/src/types";
import Attachment from "@erxes/ui/src/components/Attachment";

type Props = {
  car: ICar;
  remove: () => void;
};

const { Section } = Sidebar;

const BasicInfoSection = (props: Props) => {
  const { car, remove } = props;

  const renderEditForm = () => {
    const content = (props) => <CarForm {...props} car={car} />;

    return (
      <ModalTrigger
        title="Edit basic info"
        trigger={
          <li>
            <a href="#edit">{__("Edit")}</a>
          </li>
        }
        size="lg"
        content={content}
      />
    );
  };

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

    return (
      <Action>
        <Dropdown
          unmount={false}
          as={DropdownToggle}
          toggleComponent={
            <Button btnStyle="simple" size="medium">
              {__("Action")}
              <Icon icon="angle-down" />
            </Button>
          }
        >
          {renderEditForm()}
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
