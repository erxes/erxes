import Icon from "./Icon";
import * as React from "react";
import Popover from "@erxes/ui/src/components/Popover";
import styled from "styled-components";
import { colors, dimensions } from "../styles";

const PopoverContent = styled.div`
  padding: ${dimensions.coreSpacing}px;
  line-height: 24px;

  h5 {
    margin-top: 0;
    line-height: 20px;
  }

  ol {
    padding-left: 20px;
  }
`;

const IconClass = styled.div`
  display: inline-block;
  cursor: pointer;
  margin-left: 5px;
  font-size: 16px;
  color: ${colors.colorCoreRed};
`;

type Props = {
  title?: string;
  trigger?: "hover" | "click" | "focus";
  children: React.ReactNode;
};

class HelpPopover extends React.Component<Props> {
  render() {
    const { trigger, title } = this.props;
    return (
      <Popover
        placement="auto"
        trigger={
          <IconClass>
            <Icon icon="question-circle" />
          </IconClass>
        }
      >
        <PopoverContent>
          {title && <h5>{title}</h5>}
          {this.props.children}
        </PopoverContent>
      </Popover>
    );
  }
}

export default HelpPopover;
