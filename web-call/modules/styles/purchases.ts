import { colors, dimensions, typography } from '.';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { darken, rgba } from './ecolor';

const pWitdh = 4;

const StageTitle = styled.h3`
  color: ${colors.colorPrimary};
  text-transform: uppercase;
  margin: 0 0 20px 0;
  font-size: ${typography.fontSizeHeading6}px;
  font-weight: ${typography.fontWeightLight}px;

  button {
    float: right;
  }
`;

const Wrapper = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;
  border-radius: 3px;
  padding: ${pWitdh * 2}px ${pWitdh}px 0;
  display: flex;
  flex-wrap: wrap;
`;

const ItemWrapper = styled.div`
  margin: 0 ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px 0;
  overflow: hidden;
  background-color: ${colors.colorWhite};
  box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
  padding: ${dimensions.unitSpacing}px;
  font-size: 12px;
  border-radius: 2px;
  transition: box-shadow 0.3s ease-in-out 0s;
  cursor: pointer;
  flex-basis: 23.33333%;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    box-shadow: 0 5px 15px -5px rgba(48, 54, 60, 0.15),
      0 1px 4px 0 rgba(48, 54, 60, 0.15);

    h5 {
      color: ${colors.textSecondary};
    }
  }

  @media (max-width: 1400px) {
    flex-basis: 31.3333%;
  }

  @media (max-width: 1000px) {
    flex-basis: 48.3333%;
  }

  @media (max-width: 850px) {
    flex-basis: 98.3333%;
  }
`;

const Content = styledTS<{ type?: string }>(styled.div)`
  h5 {
    margin-bottom: 8px;
    word-break: break-word;
    line-height: 18px;
    font-size: 14px;
    font-weight: 600;
    max-height: 55px;
    min-height: 55px;
    overflow: hidden;
    display: -webkit-box;
    transition: all ease 0.3s;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }

  p {
    line-height: 20px;
    max-height: 100px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }
`;

const Right = styled.div`
  float: right;
`;

const ItemFooter = styled.div`
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dotted ${colors.borderPrimary};
  font-size: 11px;
`;

const ItemDate = styled.span`
  font-size: 11px;
  color: rgb(136, 136, 136);
`;

const TabContainers = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e8ec;
  overflow-x: hidden;
  transition: all ease 0.3;

  &:hover {
    overflow-x: auto;
  }

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c8cfd6;
    border-radius: 8px;
    cursor: pointer;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #b7bec5;
  }
`;

const TabTitle = styledTS<{ color?: string; active?: boolean }>(styled.div)`
  display: flex;
  justify-content: center;
  flex: 1 1 auto;
  line-height: 20px;
  color: ${colors.colorCoreGray};
  white-space: nowrap;
  margin-right: ${dimensions.coreSpacing}px;
  transition: all ease 0.3s;

  > a {
    cursor: pointer;
    padding: 5px 10px;
    height: 100%;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;
  }

  ${props =>
    props.active &&
    `
      border-bottom: 4px solid ${props.color || colors.colorPrimary};
      color: ${props.color || colors.colorPrimary};
      font-weight: 500;
    `}
  
  &:hover {
    color: ${props => (props.color ? props.color : colors.colorPrimary)}
  }
`;

const Label = styledTS<{ lblStyle: string; colorCode?: string }>(styled.div)`
    border-radius: 14px;
    padding: 3px 9px;
    text-transform: uppercase;
    font-size: 8px;
    display: inline-block;
    line-height: 1.32857143;
    font-weight: 600;
    background: ${({ lblStyle, colorCode }) =>
      lblStyle === 'danger'
        ? rgba(colors.colorCoreRed, 0.2)
        : lblStyle === 'custom'
        ? colorCode
        : rgba(colors.colorCoreGreen, 0.15)};
    color: ${({ lblStyle }) =>
      lblStyle === 'danger'
        ? darken(colors.colorCoreRed, 50)
        : lblStyle === 'custom'
        ? colors.colorWhite
        : darken(colors.colorCoreGreen, 50)};
`;

const DetailContent = styled.div`
  padding: 30px 50px;
  background: ${colors.colorWhite};
  border-radius: 5px;
  min-height: 300px;
  box-shadow: 0 2px 10px -3px rgba(0, 0, 0, 0.5);
  position: relative;

  h4 {
    font-size: 20px;
  }

  .content {
    font-size: 12px;

    > span {
      font-size: 12px;

      img {
        width: 26px;
        height: 26px;
        border-radius: 26px;
      }

      b {
        padding: 0 ${dimensions.unitSpacing}px;
        text-transform: uppercase;
        font-size: 11px;
        border-right: 1px solid ${colors.colorCoreGray};
        margin-right: ${dimensions.unitSpacing}px;
      }
    }
  }

  > p {
    font-size: 14px;
    padding-left: ${dimensions.coreSpacing + 15}px;
  }
`;

const Priority = styled.div`
  background: ${colors.bgActive};
  font-size: ${dimensions.unitSpacing}px;
  font-weight: 600;
  padding: 3px ${dimensions.unitSpacing}px;
  text-transform: uppercase;
  border-radius: 25px;
`;

const ListRow = styled.div`
  display: flex;
  background: ${colors.colorWhite};
  margin-bottom: ${dimensions.unitSpacing}px;
  padding: ${dimensions.unitSpacing + 5}px ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
  cursor: pointer;
  transition: all ease 0.3s;

  > div {
    display: flex;
    align-items: center;
    flex: 0 0 12%;
    font-size: 14px;
    gap: 5px;
    flex-wrap: wrap;
    padding: 0 ${dimensions.unitSpacing - 5}px;

    &:first-child {
      flex: 0 0 30%;
      text-align: left;
      font-weight: 600;
      text-transform: capitalize;
    }
  }

  &:hover {
    background: #f5f5f5;
  }
`;

const ListHead = styled.div`
  display: flex;
  background-color: ${colors.bgLight};
  padding: ${dimensions.unitSpacing + 5}px ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  margin-bottom: ${dimensions.unitSpacing}px;
  border-radius: 5px;

  > div {
    display: inline-block;
    font-weight: 600;
    flex: 0 0 12%;
    color: ${colors.colorCoreGray};
    text-transform: uppercase;
    font-size: 12px;
    padding: 0 ${dimensions.unitSpacing - 5}px;

    &:first-child {
      flex: 0 0 30%;
      text-align: left;
    }
  }
`;
const ListBody = styled.div``;

export {
  Wrapper,
  StageTitle,
  ItemWrapper,
  Content,
  ItemFooter,
  Right,
  ItemDate,
  TabContainers,
  TabTitle,
  Priority,
  DetailContent,
  Label,
  ListHead,
  ListRow,
  ListBody
};
