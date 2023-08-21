import React, { useState } from "react";
import styled, { css } from "styled-components";

import Attachment from "./Attachment";
import { IAttachment } from "./types";
import colors from "../styles/colors";
import { confirm } from "../utils";
import { rgba } from "../styles/ecolor";
import styledTS from "styled-components-ts";

const List = styled.div`
  margin: 10px 0;
`;

const Item = styledTS<{ hasBackground?: boolean }>(styled.div)`
  font-size: 12px;
  margin-bottom: 10px;

  h5 {
    font-size: 15px;
  }
`;

const Delete = styled.span`
  text-decoration: underline;
  transition: all 0.3s ease;
  color: ${colors.colorCoreGray};
  &:hover {
    color: ${colors.colorCoreBlack};
    cursor: pointer;
  }
`;

const ToggleButton = styled(Delete.withComponent("div"))`
  padding: 7px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  &:hover {
    background: ${rgba(colors.colorCoreDarkBlue, 0.07)};
  }
`;

type Props = {
  attachments: IAttachment[];
  onChange?: (attachments: IAttachment[]) => void;
  removeAttachment?: (index: number) => void;
  limit?: number;
  hasBackground?: boolean;
};

function AttachmentsGallery(props: Props) {
  const [hideOthers, toggleHide] = useState(true);

  const removeAttachment = (index: number) => {
    props.removeAttachment(index);
  };

  const toggleAttachments = () => {
    toggleHide(!hideOthers);
  };

  const renderItem = (item: IAttachment, index: number) => {
    const onRemove = () => {
      confirm().then(() => removeAttachment(index));
    };

    return (
      <Item key={item.url} hasBackground={props.hasBackground}>
        <Attachment
          attachment={item}
          attachments={props.attachments}
          index={index}
        />
      </Item>
    );
  };

  const renderToggleButton = (hiddenCount: number) => {
    if (hiddenCount > 0) {
      const buttonText = hideOthers
        ? `View all attachments (${hiddenCount} hidden)`
        : `Show fewer attachments`;

      return (
        <ToggleButton onClick={toggleAttachments}>{buttonText}</ToggleButton>
      );
    }

    return null;
  };

  const { limit = 4 } = props;
  const length = props.attachments.length;

  return (
    <>
      <List>
        {props.attachments
          .slice(0, limit && hideOthers ? limit : length)
          .map((item, index) => renderItem(item, index))}
      </List>
      {renderToggleButton(length - limit)}
    </>
  );
}

export default AttachmentsGallery;
