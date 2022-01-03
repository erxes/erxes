import React from "react";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import { colors, dimensions } from "../styles";
import { rgba } from "../styles/ecolor";
import Icon from "./Icon";

const addition = 2;

const colorTypes = (type, value) => {
  switch (type) {
    case "warning":
      if (value === "content") return colors.colorCoreSunYellow;
      if (value === "background") return rgba(colors.colorCoreYellow, 0.2);
      if (value === "icon") return "exclamation-triangle";
    case "danger":
      if (value === "content") return colors.colorCoreRed;
      if (value === "background") return rgba(colors.colorCoreRed, 0.1);
      if (value === "icon") return "times-circle";
    case "info":
      if (value === "content") return colors.colorCoreBlue;
      if (value === "background") return rgba(colors.colorCoreBlue, 0.2);
      if (value === "icon") return "info-circle";
    case "success":
      if (value === "content") return colors.colorCoreGreen;
      if (value === "background") return rgba(colors.colorCoreGreen, 0.2);
      if (value === "icon") return "check-circle";
    default:
      if (value === "content") return colors.colorPrimary;
      if (value === "background") return rgba(colors.colorPrimary, 0.1);
      if (value === "icon") return "envelope-alt";
  }
};

const InfoBox = styledTS<{ color?: string; type?: string; iconShow }>(
  styled.div
)`
  min-height: ${dimensions.coreSpacing * 2}px;
  padding: ${(props) =>
    props.iconShow ? dimensions.unitSpacing / 2 : dimensions.unitSpacing + 5}px
    ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  background-color: ${(props) => colorTypes(props.type, "background")};
            
  border: ${(props) =>
    `${addition / 2}px solid ${colorTypes(props.type, "background")}`};
  
  border-radius: ${addition * 2}px;
  display: flex;

  h4 {
    margin-top: ${dimensions.unitSpacing / 2}px;
    margin-bottom: ${dimensions.coreSpacing}px;
  }
`;

const InfoTitle = styledTS(styled.div)`
  font-size: 20px;
  margin-bottom: ${dimensions.unitSpacing / 2}px;
`;

const IconContainer = styledTS<{ type?: string }>(styled.div)`
  margin-right: ${dimensions.unitSpacing}px;
  color: ${(props) => colorTypes(props.type, "content")};
`;

const ContentContainer = styledTS<{ type?: string }>(styled.div)`
  color: ${(props) => colorTypes(props.type, "content")};
  font-size: 14px;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

type Props = {
  children: React.ReactNode;
  type?: "primary" | "danger" | "warning" | "success" | "info";
  color?: string;
  title?: string;
  iconShow?: boolean;
};

class Info extends React.PureComponent<Props> {
  static defaultProps = {
    color: colors.colorPrimaryDark,
  };

  renderIcon() {
    if (!this.props.iconShow) {
      return null;
    }

    return (
      <IconContainer type={this.props.type}>
        <Icon size={26} icon={colorTypes(this.props.type, "icon")}></Icon>
      </IconContainer>
    );
  }

  render() {
    const {
      title,
      children,
      color,
      type = "primary",
      iconShow = false,
    } = this.props;

    return (
      <InfoBox title={title} type={type} color={color} iconShow={iconShow}>
        {this.renderIcon()}
        <ContentContainer type={type}>
          {title && <InfoTitle>{title}</InfoTitle>}
          {children}
        </ContentContainer>
      </InfoBox>
    );
  }
}

export default Info;
