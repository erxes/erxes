import colors from '@erxes/ui/src/styles/colors';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const LogBox = styledTS<{ color?: string }>(styled.div)`
  border: 1px dotted ${props =>
    props.color ? props.color : colors.colorPrimary};
  padding: 10px;
  margin: 10px;
  
  > div {
    margin-bottom: 10px;

    > ul {
      margin: 0;
    }
  }

  .field-name {
    font-weight: bold;  
  }

  .field-value {
    padding-left: 10px;
    
    > div {
      display: inline-block;
    }
  }

  &:hover {
    overflow: auto;
  }
`;

const LogBoxContainer = styledTS<{ onlyOne?: boolean }>(styled.div)`
  display: grid;
  
  ${props =>
    props.onlyOne
      ? 'grid-template-columns: 1fr'
      : 'grid-template-columns: repeat(2, 1fr)'};

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const CustomRangeContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-end;
  > div {
    flex: 1;
    margin-right: 8px;
    input[type='text'] {
      border: none;
      width: 100%;
      height: 34px;
      padding: 5px 0;
      color: #444;
      border-bottom: 1px solid;
      border-color: #ddd;
      background: none;
      border-radius: 0;
      box-shadow: none;
      font-size: 13px;
    }
  }
`;

const TableCell = styledTS<{ showMore?: boolean }>(styled.td)`
  max-width: calc(100vw / 7);
  position: relative;
  display: flex;

  > ul {
    overflow : hidden;
    word-wrap: break-word;
    width : 95%;
    ${props =>
      !props.showMore &&
      `
    height:20px;
    `}
  }

  > span {
    cursor: pointer;
    position: absolute;
    right: 5px;
    top: 10px;
  }
`;

const FilterContainer = styled.div`
  padding: 10px 20px 20px;
`;

const LogsMail = styled.div`
  max-height: 300px;
  max-width: 300px;
  background-color: white;
  padding: 10px;
`;

const RowWrapper = styled.tr`
  .inner-tooltip {
    max-width: '500px' !important;
    background-color: blue;
  }
`;

export {
  LogBox,
  LogBoxContainer,
  CustomRangeContainer,
  FilterContainer,
  TableCell,
  LogsMail,
  RowWrapper
};
