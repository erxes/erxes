import { colors, dimensions, typography } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { DateContainer } from '@erxes/ui/src/styles/main';

const coreSpace = `${dimensions.coreSpacing}px`;

const ActionButtons = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  transition: all 0.3s ease;
  width: 0;

  * {
    padding: 0;
    margin-left: ${dimensions.unitSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const SidebarListItem = styledTS<{ isActive: boolean }>(styled.li)`
  position: relative;
  border-bottom: 1px solid ${colors.borderPrimary};
  background: ${props => props.isActive && colors.bgActive};
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;
  a {
    white-space: normal;
    flex: 1;
    padding: 10px 0 10px 20px;
    font-weight: 500;
    &:hover {
      background: none;
    }
    &:focus {
      color: inherit;
      text-decoration: none;
    }
    > span {
      color: #666;
      font-weight: normal;
    }
  }
  &:last-child {
    border: none;
  }
  &:hover {
    cursor: pointer;
    background: ${props => !props.isActive && colors.bgLight};
    ${ActionButtons} {
      width: 35px;
    }
  }
`;

const MarkdownWrapper = styled.div`
  position: relative;
  background: ${colors.colorWhite};
  border: 1px solid ${colors.colorShadowGray};
  border-radius: 2px;
  margin: ${dimensions.unitSpacing - 5}px 0;

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
    margin: 0;
    padding: 20px;
  }
`;

const ExpandWrapper = styled.div`
  flex: 1;
  margin-right: 20px;

  &:last-of-type {
    margin-right: 0;
  }
`;

const Description = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
`;

const FlexRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
`;

const SubHeading = styled.h4`
  border-bottom: 1px dotted ${colors.colorShadowGray};
  padding-bottom: ${dimensions.unitSpacing}px;
  font-size: ${typography.fontSizeHeading7}px;
  margin: ${dimensions.coreSpacing}px 0 ${dimensions.unitSpacing}px;
  color: ${colors.colorCoreDarkGray};

  span {
    display: block;
    text-transform: none;
    font-weight: normal;
    margin-top: ${dimensions.unitSpacing}px;
    color: ${colors.colorCoreGray};
    font-size: 12px;
  }
`;

const WidgetBackgrounds = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const Capitalize = styled.span`
  text-transform: capitalize;
  font-weight: 500;
`;

const LinkButton = styled.a`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const FilterItem = styled(DateContainer)`
  position: relative;
  float: left;
  min-width: 200px;
  margin-right: 20px;
  z-index: 100;
`;

export {
  MarkdownWrapper,
  ActionButtons,
  ExpandWrapper,
  Description,
  FlexRow,
  SubHeading,
  WidgetBackgrounds,
  Capitalize,
  LinkButton,
  FilterItem
};
