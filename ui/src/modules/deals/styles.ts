import { colors, dimensions } from 'modules/common/styles';
import { darken, rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FormContainer = styled.div`
  .Select-multi-value-wrapper {
    display: flex;
    min-width: 100px;
  }

  .Select-clear {
    line-height: 1;
  }

  .Select--single > .Select-control .Select-value {
    max-width: 135px;
  }
`;

const ProductItem = styled.div`
  background: ${colors.colorWhite};
  padding: 20px;
  margin-bottom: 10px;
  box-shadow: 0 0 8px 1px rgba(221, 221, 221, 0.7);
  position: relative;

  label {
    font-size: 10px;
  }

  > button {
    position: absolute;
    right: 10px;
    top: 10px;
    padding: 5px 8px;
    background: ${colors.borderPrimary};
  }
`;

const ContentRow = styled.div`
  display: flex;
`;

const ContentRowTitle = styled.div`
  display: flex;
  text-align: center;
  margin-top: ${dimensions.coreSpacing}px;
`;

const ContentColumn = styled.div`
  flex: 1;
  margin-right: 10px;

  &:last-of-type {
    margin-right: 0;
  }
`;

const TickUsed = styled.div`
  text-align: center;
  margin-top: 35px;
  padding: 0 15px;
`;

const TotalAmount = styled.div`
  text-align: right;
  font-size: 20px;
  margin-top: 30px;
  padding: 2px 15px;
  background: ${rgba(colors.colorCoreTeal, 0.2)};
  border-radius: 15px;
  float: right;
`;

const FooterInfo = styled.div`
  overflow: hidden;

  table {
    text-align: right;
    float: right;
    width: 40%;
    font-size: 16px;
  }
`;

const Add = styled.div`
  display: block;
  margin: 20px;
  text-align: center;
`;

const ItemText = styledTS<{ align?: string }>(styled.div)`
  line-height: 34px;
  margin-top: 1px;
  text-align: ${props => props.align || 'left'};

  > span {
    font-size: 80%;
    color: ${colors.colorCoreGray};
  }
`;

const ProductButton = styled.div`
  padding: 7px 10px;
  background: ${colors.colorWhite};
  cursor: pointer;
  border-radius: 4px;
  border-bottom: 1px solid ${colors.borderDarker};
  transition: all 0.3s ease;
  background: ${colors.bgLight};

  &:hover {
    background: ${colors.bgActive};
  }

  i {
    float: right;
  }
`;

const CategoryContainer = styled.div`
  flex: 1;
  flex-shrink: 0;
`;

const CustomField = styled.div`
  text-align: left;
  padding: ${dimensions.unitSpacing}px;
`;

const ProductName = styled.div`
  cursor: pointer;

  > i { visibility: hidden; }

  &:hover i {
    visibility: visible;
  }
`;

const Divider = styled.div`
  border-bottom: 1px dotted ${darken(colors.borderDarker, 5)};
  padding-bottom: ${dimensions.coreSpacing}px;
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0px;

  @media (max-width: 1170px) {
    margin-left: ${dimensions.coreSpacing}px;
  }
`;

const WrongLess = styled.span`
  color: red;
`;

export {
  ProductName,
  FormContainer,
  CategoryContainer,
  FooterInfo,
  CustomField,
  Add,
  ItemText,
  ProductItem,
  ContentRow,
  ContentRowTitle,
  ContentColumn,
  TickUsed,
  TotalAmount,
  ProductButton,
  Divider,
  WrongLess
};
