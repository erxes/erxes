import {
  IRichTextEditorControlBaseProps,
  RichTextEditorControlBase,
} from "./RichTextEditorControl";
import React, { ReactNode } from "react";
import {
  RichTextEditorMenuPopoverWrapper,
  RichTextEditorMenuWrapper,
} from "./styles";

import Icon from "../../Icon";
import Popover from "@erxes/ui/src/components/Popover";
import { useRichTextEditorContext } from "../RichTextEditor.context";

export interface IRichTextEditorMoreControlProps
  extends React.HTMLAttributes<HTMLDivElement> {
  toolbarPlacement?: "top" | "bottom";
  children: ReactNode;
}

const MoreIcon: IRichTextEditorControlBaseProps["icon"] = () => (
  <Icon icon="ellipsis-v" />
);

export const MoreButtonControl = (props: IRichTextEditorMoreControlProps) => {
  let overLayRef;

  const { labels } = useRichTextEditorContext();
  const { toolbarPlacement, children } = props;

  const renderMenu = (props) => (
    <RichTextEditorMenuPopoverWrapper>
      {/* <Popover id="rte-more-menu" {...props}> */}
      <RichTextEditorMenuWrapper>{children}</RichTextEditorMenuWrapper>
      {/* </Popover> */}
    </RichTextEditorMenuPopoverWrapper>
  );

  return (
    <Popover
      trigger={
        <RichTextEditorControlBase
          icon={MoreIcon}
          aria-label={labels.moreControlLabel}
          title={labels.moreControlLabel}
        />
      }
      placement="bottom-end"
    >
      {renderMenu}
    </Popover>
  );
};
