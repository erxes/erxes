import { colors } from 'modules/common/styles';
import { lighten } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
const FilterBox = styled.div`
  padding: 10px 20px 0 20px;
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;

  h4 {
    text-align: center;
    font-size: 16px;
    font-weight: 600;
  }

  .Select {
    margin-bottom: 10px;
  }

  .date-form input {
    display: block;
    border: none;
    width: 100%;
    height: 34px;
    padding: 10px;
    border-bottom: 1px solid ${colors.colorShadowGray};
    background: none;
    box-shadow: none;
    border-radius: 0;
    font-size: 12px;
  }
`;

const FilterDetail = styledTS<{ selected: boolean }>(styled.div)`
  text-transform: none;
  outline: 0;
  padding: 5px 15px;
  background: ${props =>
    props.selected ? colors.colorSecondary : 'rgba(0, 0, 0, 0.04)'};
  color: ${props =>
    props.selected ? colors.colorWhite : colors.colorCoreGray};
  font-size: 12px;
  width: 100%;
  margin-left: 0;
  margin-top: 10px;
  text-align: left;
  cursor: pointer;
  position: relative;
  list-style: none;
  border-radius: 30px;
`;

const DateFilter = styled.div`
  margin-top: 20px;
`;

const FilterItem = styled.div`
  position: relative;
`;

const ClearDate = styledTS<{ selected: boolean }>(styled.div)`
  button {
    position: absolute;
    color: ${props =>
      props.selected ? colors.colorWhite : colors.colorCoreGray};
    right: 0;
    bottom: 0px;
    width: 32px;
    padding: 5px 10px;
    background: none;

    &:hover {
      color: ${props =>
        props.selected ? colors.colorWhite : colors.colorCoreGray};
    }
  }
`;

const FilterBtn = styledTS<{ active?: boolean }>(styled.div)`
    box-shadow: ${props =>
      props.active
        ? `0 2px 16px 0 ${lighten(colors.colorCoreGreen, 25)}`
        : 'none'}; 
    background: ${props =>
      props.active ? colors.colorCoreGreen : 'transparent'};
    border-radius: 30px;
    transition: background-color 0.3s ease;
    button{
      font-size:10px;
      color: ${colors.colorWhite};
      transition: background-color 0.3s ease;
    }
  span {
    margin-left: 0;
  }
`;

const ClearFilter = styled.div`
  padding: 20px;
`;

const RemoveFilter = styled.span`
  button {
    padding: 0;
    color: ${colors.colorWhite};
    margin-right: 12px;
    margin-left: -5px;
    &:hover {
      color: ${colors.borderPrimary};
    }
  }
`;

export {
  FilterBox,
  DateFilter,
  ClearDate,
  FilterBtn,
  ClearFilter,
  FilterItem,
  FilterDetail,
  RemoveFilter
};
