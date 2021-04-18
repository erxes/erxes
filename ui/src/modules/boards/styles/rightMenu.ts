import {
  TabCaption,
  TabContainer
} from 'modules/common/components/tabs/styles';
import { colors } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FilterBox = styled.div`
  .Select {
    margin-bottom: 15px;
  }

  input {
    margin-bottom: 20px;
  }

  .input-container {
    width: 50%;
  }
`;

const CustomRangeContainer = styled.div`
  display: flex;

  > div {
    flex: 1;

    &:last-child {
      margin-left: 5px;
    }
  }

  input[type='date'] {
    width: 100%;
  }
`;

const FilterButton = styledTS<{ selected?: boolean }>(styled.div)`
  padding: 5px 20px;
  background: ${props =>
    props.selected ? colors.colorSecondary : colors.bgActive};
  color: ${props =>
    props.selected ? colors.colorWhite : colors.textSecondary};
  line-height: 20px;
  width: 100%;
  margin-bottom: 10px;
  position: relative;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;

  &:hover {
    background: ${props =>
      props.selected ? colors.colorPrimaryDark : colors.bgGray};
    cursor: pointer;
  }
`;

export const RightMenuContainer = styled.div`
  position: fixed;
  z-index: 2;
  top: 100px;
  right: 0;
  bottom: 0;
  width: 300px;
  background: ${colors.bgLight};
  white-space: normal;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 24px -6px rgba(9, 30, 66, 0.25),
    0 0 0 1px rgba(9, 30, 66, 0.08);

  ${TabContainer} {
    height: 40px;
  }

  ${TabCaption} {
    padding: 10px 20px;
  }
`;

export const TabContent = styled.div`
  padding: 15px 20px 0px 20px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
`;

const MenuFooter = styled.footer`
  padding: 10px 20px;
`;

const ArchiveWrapper = styled.div`
  height: 100%;
  height: calc(100% - 60px);
`;

const TopBar = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: flex-end;

  > span {
    flex: 1;
    margin-right: 10px;

    input[type='text'] {
      width: 100%;
    }
  }
`;

const ItemContainer = styled.div`
  margin-bottom: 20px;

  > span {
    text-decoration: underline;
    color: ${colors.colorCoreGray};

    &:hover {
      cursor: pointer;
      color: ${colors.textSecondary};
    }
  }
`;

const LoadMore = styled.span`
  text-decoration: underline;
  margin-bottom: 10px;
  color: ${colors.colorCoreGray};
  display: block;
  text-align: center;

  > i {
    margin-right: 5px;
  }

  &:hover {
    cursor: pointer;
    color: ${colors.textSecondary};
  }
`;

const BoardItem = styled.div`
  box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
  padding: 8px 10px;
  outline: 0px;
  margin-bottom: 5px;
  border-radius: 4px;
  background: ${colors.colorWhite};
  font-weight: 500;
`;

export {
  FilterBox,
  FilterButton,
  MenuFooter,
  TopBar,
  ItemContainer,
  LoadMore,
  CustomRangeContainer,
  BoardItem,
  ArchiveWrapper
};
