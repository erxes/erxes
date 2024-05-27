import { dimensions, colors, ContentHeader } from '@erxes/ui/src';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const Description = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
`;

export const FilterBox = styled.div`
  text-align: left;
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

export const CustomRangeContainer = styled.div`
  display: flex;

  > div {
    flex: 1;

    &:last-child {
      margin-left: 5px;
    }
  }

  input {
    max-width: 175px;
  }

  .filterDate {
    max-width: 50%;
  }
`;

export const FilterButton = styledTS<{ selected?: boolean }>(styled.div)`
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
  width: 400px;
  background: ${colors.bgLight};
  white-space: normal;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 24px -6px rgba(9, 30, 66, 0.25),
    0 0 0 1px rgba(9, 30, 66, 0.08);
`;

export const TabContent = styled.div`
  padding: 15px 20px 0px 20px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
`;

export const MenuFooter = styled.footer`
  display: flex;
  padding: 10px 20px;
  max-width: 95%;
`;
