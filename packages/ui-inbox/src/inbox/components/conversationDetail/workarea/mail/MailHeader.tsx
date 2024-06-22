import {
  ActionButton,
  AddressContainer,
  Addresses,
  Date,
  Details,
  From,
  Meta,
  RightSide,
  Title,
} from "./style";
import { IMail, IMessage } from "../../../../types";
import React, { useState } from "react";

import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import { Flex } from "@erxes/ui/src/styles/main";
import { ICustomer } from "@erxes/ui-contacts/src/customers/types";
import Icon from "@erxes/ui/src/components/Icon";
import { Menu } from "@headlessui/react";
import NameCard from "@erxes/ui/src/components/nameCard/NameCard";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils";
import dayjs from "dayjs";

type MailHeaderProps = {
  message: IMessage;
  isContentCollapsed: boolean;
  onToggleContent: () => void;
  onToggleMailForm: (
    event: any,
    replyToAll?: boolean,
    isForward?: boolean
  ) => void;
};

const MailHeader: React.FC<MailHeaderProps> = ({
  message,
  isContentCollapsed,
  onToggleContent,
  onToggleMailForm,
}) => {
  const [dateFormat, setDateFormat] = useState<string>("MMM D, h:mm A");
  const [isDetailExpanded, setIsDetailExpanded] = useState<boolean>(false);

  const toggleDateFormat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDateFormat(dateFormat === "lll" ? "MMM D, h:mm A" : "lll");
  };

  const toggleExpand = (e: React.MouseEvent) => {
    if (isContentCollapsed) {
      return;
    }

    e.stopPropagation();
    setIsDetailExpanded(!isDetailExpanded);
  };

  const onToggleMailFormFunction = ({
    event,
    replyToAll = false,
    isForward = false,
  }: {
    event: any;
    replyToAll?: boolean;
    isForward?: boolean;
  }) => {
    event.stopPropagation();

    onToggleMailForm(event, replyToAll, isForward);
  };

  const renderTopButton = () => {
    if (isContentCollapsed) {
      return null;
    }

    const onToggleReply = (event: React.MouseEvent) =>
      onToggleMailFormFunction({ event });
    const onToggleReplyAll = (event: React.MouseEvent) =>
      onToggleMailFormFunction({ event, replyToAll: true });
    const onToggleForward = (event: React.MouseEvent) =>
      onToggleMailFormFunction({ event, isForward: true });

    // const MenuButton = React.forwardRef(function (props, ref) {
    //   return <ActionButton />;
    // });

    return (
      <>
        <Tip text={__("Reply")} placement="bottom">
          <ActionButton onClick={onToggleReply}>
            <Icon icon="reply" />
          </ActionButton>
        </Tip>
        <Dropdown
          as={DropdownToggle}
          toggleComponent={
            <Menu.Button>
              <ActionButton>
                <Icon icon="ellipsis-v" />
              </ActionButton>
            </Menu.Button>
          }
        >
          <Menu.Item>
            <a onClick={onToggleReply}>Reply</a>
          </Menu.Item>
          <Menu.Item>
            <a onClick={onToggleReplyAll}>Reply all</a>
          </Menu.Item>
          <Menu.Item>
            <a onClick={onToggleForward}>Forward</a>
          </Menu.Item>
        </Dropdown>
      </>
    );
  };

  const renderRightSide = (hasAttachments: boolean, createdAt: Date) => {
    return (
      <RightSide>
        <Date onClick={toggleDateFormat}>
          {dayjs(createdAt).format(dateFormat)}
        </Date>
        {hasAttachments && <Icon icon="paperclip" />}
        {renderTopButton()}
      </RightSide>
    );
  };

  const renderAddress = (title: string, values: any) => {
    if (!values || values.length === 0) {
      return null;
    }

    const { length } = values;

    const emails = values.map((val: any, idx: number) => (
      <React.Fragment key={idx}>
        <span>{val.email}</span>
        {length - 1 !== idx && `,${" "}`}
      </React.Fragment>
    ));

    return (
      <Flex>
        <Title>{title}</Title>
        <Addresses>{emails}</Addresses>
      </Flex>
    );
  };

  const renderCustomer = (fromEmail: string) => {
    const { customer = {} as ICustomer } = message;

    if (!customer) {
      return null;
    }

    if (customer.firstName === fromEmail) {
      return (
        <div>
          <strong>{fromEmail}</strong>
        </div>
      );
    }

    return (
      <div>
        <strong>{customer.firstName}</strong>{" "}
        <From>
          {"<"}
          {fromEmail}
          {">"}
        </From>
      </div>
    );
  };

  const renderSecondaryContent = (mailData: IMail) => {
    if (isContentCollapsed) {
      // remove all tags and convert plain text
      const plainContent = (message.content || "").trim();

      return <div>{plainContent.substring(0, 100)}...</div>;
    }

    return (
      <AddressContainer $isExpanded={isDetailExpanded}>
        {renderAddress("To:", mailData.to)}
        {renderAddress("Cc:", mailData.cc)}
        {renderAddress("Bcc:", mailData.bcc)}
      </AddressContainer>
    );
  };

  const renderDetails = (mailData: IMail) => {
    const [from] = mailData.from || [{}];

    const modifiedEmail = from.email.replace("noreply@", "");
    if (from.email) {
      return (
        <Details onClick={toggleExpand} $clickable={!isContentCollapsed}>
          {renderCustomer(modifiedEmail || "")}
          {renderSecondaryContent(mailData)}
        </Details>
      );
    }
  };

  const { createdAt, mailData = {} as IMail } = message;
  const hasAttachments = mailData
    ? (mailData.attachments || []).length > 0
    : false;

  return (
    <Meta $toggle={isContentCollapsed} onClick={onToggleContent}>
      <NameCard.Avatar customer={message.customer} size={32} letterCount={1} />
      {renderDetails(mailData)}
      {renderRightSide(hasAttachments, createdAt)}
    </Meta>
  );
};

export default MailHeader;
