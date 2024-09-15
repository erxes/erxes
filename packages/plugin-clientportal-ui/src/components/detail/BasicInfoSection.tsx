import { Actions, Flex } from "@erxes/ui/src/styles/main";
import { __, loadDynamicComponent } from "@erxes/ui/src/utils";

import Alert from "@erxes/ui/src/utils/Alert";
import Button from "@erxes/ui/src/components/Button";
import ClientPortalUserForm from "../../containers/ClientPortalUserForm";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import ExtendSubscription from '@erxes/ui-forum/src/containers/ExtendSubscriptionForm';
import EmailWidget from "@erxes/ui-inbox/src/inbox/components/EmailWidget";
import { IClientPortalUser } from "../../types";
import Icon from "@erxes/ui/src/components/Icon";
import { ModalTrigger } from "@erxes/ui/src/components";
import React from "react";
import SmsForm from "@erxes/ui-inbox/src/settings/integrations/containers/telnyx/SmsForm";
import Tip from "@erxes/ui/src/components/Tip";
import { confirm } from "@erxes/ui/src/utils";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  clientPortalUser: IClientPortalUser;
  remove: () => void;
  isSmall?: boolean;
};

const BasicInfoSection: React.FC<Props> = ({
  clientPortalUser,
  remove,
  isSmall,
}: Props) => {
  const renderActions = () => {
    const { phone, email, isEmailVerified } = clientPortalUser;

    const smsForm = (props) => <SmsForm {...props} phone={phone} />;

    return (
      <>
        {(isEnabled("engages") || isEnabled("imap")) && (
          <EmailWidget
            disabled={isEmailVerified && email ? false : true}
            buttonStyle={isEmailVerified && email ? "primary" : "simple"}
            emailTo={email}
            customerId={clientPortalUser._id || undefined}
            buttonSize="small"
            type="action"
          />
        )}
        <ModalTrigger
          dialogClassName="middle"
          title={`Send SMS to (${phone})`}
          trigger={
            <Button
              disabled={phone ? false : true}
              size="small"
              btnStyle={phone ? "primary" : "simple"}
            >
              <Icon icon="message" />
            </Button>
          }
          content={smsForm}
          tipText="Send SMS"
        />
        <Tip text="Call" placement="top-end">
          <Flex>
            <Button
              href={phone && `tel:${phone}`}
              size="small"
              btnStyle={phone ? "primary" : "simple"}
              disabled={phone ? false : true}
            >
              <Icon icon="phone" />
            </Button>
          </Flex>
        </Tip>
      </>
    );
  };

  const renderButton = () => {
    return (
      <Button size="small" btnStyle="default">
        {isSmall ? (
          <Icon icon="ellipsis-h" />
        ) : (
          <>
            {__("Action")} <Icon icon="angle-down" />
          </>
        )}
      </Button>
    );
  };

  const renderDropdown = () => {
    const onClick = () =>
      confirm()
        .then(() => remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    const customerForm = (props) => {
      return (
        <ClientPortalUserForm
          {...props}
          size="lg"
          clientPortalUser={clientPortalUser}
        />
      );
    };

    const menuItems = [
      {
        title: "Edit basic info",
        trigger: <a href="#edit">{__("Edit")}</a>,
        content: customerForm,
        additionalModalProps: { size: "lg" },
      }
    ];

    const extendSubscription = (props) => {
      // TODO: use loadDynamicComponent
      return (
        <ExtendSubscription {...props} clientPortalUser={clientPortalUser} />
      );
    };

    if (isEnabled("forum")) {
      menuItems.push({
        title: "Extend Subscription",
        trigger: <a href="#extend-subscription">{__("Extend Subscription")}</a>,
        content: extendSubscription,
        additionalModalProps: { size: "lg" }
      })
    }

    return (
      <Dropdown
        as={DropdownToggle}
        toggleComponent={renderButton()}
        modalMenuItems={menuItems}
      >
        <li>
          <a href="#delete" onClick={onClick}>
            {__("Delete")}
          </a>
        </li>
      </Dropdown>
    );
  };

  return (
    <>
      {loadDynamicComponent(
        "clientPortalUserDetailAction",
        { clientPortalUser },
        true
      )}
      <Actions>
        {renderActions()}
        {renderDropdown()}
      </Actions>
    </>
  );
};

export default BasicInfoSection;
