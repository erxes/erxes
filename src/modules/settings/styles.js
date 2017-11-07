import styled from 'styled-components';
import { dimensions, colors } from 'modules/common/styles';

const coreSpace = `${dimensions.coreSpacing}px`;
const unitSpace = `${dimensions.unitSpacing}px`;

const ContentBox = styled.div`
  padding: ${coreSpace};
`;

const Margined = styled.div`
  margin: 20px;
  overflow: hidden;
`;

const LogoContainer = styled.div`
  color: #fff;
  line-height: 56px;
  text-align: center;
  border-radius: 28px;
  width: 56px;
  height: 56px;
  cursor: pointer;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  background-color: #452679;
  background-position: center;
  background-size: 46px;
  background-repeat: no-repeat;
  margin-top: 10px;
  position: relative;
  float: right;

  span {
    position: absolute;
    width: 20px;
    height: 20px;
    background: #f74040;
    display: block;
    right: -2px;
    top: -5px;
    color: #fff;
    border-radius: 10px;
    text-align: center;
    line-height: 20px;
    font-size: 10px;
  }
`;

const ColorPick = styled.div`
  border-radius: 4px;
  display: inline-block;
  padding: 5px;
  border: 1px solid #ddd;
  cursor: pointer;
`;

const ColorPicker = styled.div`
  width: 80px;
  height: 15px;
`;

const WidgetApperance = styled.div`
  display: flex;
  flex-direction: row;
`;

const WidgetBox = styled.div`
  margin-bottom: 20px;
`;

const WidgetSettings = styled.div`
  padding: 10px 30px 10px 10px;
`;

const SubHeading = styled.h4`
  text-transform: uppercase;
  font-weight: 500;
  border-bottom: 1px dotted ${colors.colorShadowGray};
  padding-bottom: ${unitSpace};
  font-size: 12px;
  margin: 0 0 ${coreSpace};
`;

const MarkdownWrapper = styled.div`
  position: relative;
  background: ${colors.bgLight};
  border: 1px solid ${colors.colorShadowGray};

  > div {
    background: none;
  }

  button {
    position: absolute;
    right: ${coreSpace};
    top: ${coreSpace};
  }

  pre {
    border: none;
    background: none;
  }
`;

const InlineItems = styled.div`
  display: flex;
  margin-bottom: ${unitSpace};
  align-items: center;

  > div {
    margin-right: ${unitSpace};
  }
`;

const SubItem = styled.div`
  margin-bottom: ${coreSpace};
`;

const Well = styled.div`
  min-height: ${coreSpace};
  padding: ${coreSpace};
  margin-bottom: ${coreSpace};
  background-color: ${colors.bgLight};
  border: 1px solid ${colors.colorShadowGray};
`;

export {
  ContentBox,
  SubHeading,
  MarkdownWrapper,
  InlineItems,
  SubItem,
  Well,
  Margined,
  WidgetApperance,
  WidgetSettings,
  WidgetBox,
  ColorPick,
  ColorPicker,
  LogoContainer
};
