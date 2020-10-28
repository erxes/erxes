import { Input } from 'modules/common/components/form/styles';
import { colors, dimensions } from 'modules/common/styles';
import { darken } from 'modules/common/styles/color';
import { highlight } from 'modules/common/utils/animations';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FormContainer = styled.div`
  margin-top: 20px;

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

const ProductItemContainer = styled.div`
  position: relative;
  padding: 8px;

  ${Input} {
    text-align: right;
  }
`;

const ContentRow = styled.div`
  display: flex;
`;

const ItemRow = styled(ContentRow)`
  margin-bottom: 5px;
  align-items: center;
`;

const ContentRowTitle = styled(ContentRow)`
  text-align: center;
  margin-top: ${dimensions.coreSpacing}px;
`;

const ContentColumn = styledTS<{ flex?: string }>(styled.div)`
  flex: ${props => (props.flex ? props.flex : '1')};
  margin-right: 10px;

  &:last-of-type {
    margin-right: 0;
  }
`;

const FooterInfo = styled.div`
  overflow: hidden;

  table {
    text-align: right;
    float: right;
    width: 50%;
    font-size: 14px;
  }

  ${Input} {
    direction: rtl;
  }
`;

const Add = styled.div`
  display: block;
  margin: 20px;
  text-align: center;
`;

const Amount = styled.div`
  line-height: 34px;
  margin-top: 1px;
  text-align: right;
  color: ${colors.textPrimary};
`;

const Measure = styled(Amount)`
  margin-left: 5px;
  font-weight: bold;
`;

const ItemText = styledTS<{ align?: string }>(styled(Amount))`
  text-align: ${props => props.align || 'left'};
  flex: 2;
  font-weight: 500;
`;

const ProductButton = styled.div`
  padding: 7px 10px;
  background: ${colors.colorWhite};
  cursor: pointer;
  border-radius: 4px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
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

const ProductName = styled.a`
  cursor: pointer;
  color: ${colors.textSecondary};
  display: flex;
  justify-content: space-between;

  > i {
    visibility: hidden;
  }

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

const ProductTableWrapper = styled.div`
  table {
    border-collapse: separate;
    border-spacing: 0 6px;

    thead tr th {
      position: inherit;
    }

    tr td {
      background: ${colors.colorWhite};

      &:first-child {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
      }

      &:last-child {
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
      }
    }

    tr td,
    tr th {
      padding: 8px 12px;
      border: none;
    }
  }

  tr td:not(:first-child),
  tr th:not(:first-child) {
    text-align: right;
  }

  tr td:first-child {
    text-align: left;
  }

  tbody tr {
    margin-bottom: 5px;
    border-radius: 6px;
    box-shadow: 0 0 5px 0 rgba(221, 221, 221, 0.7);

    &.active {
      animation: ${highlight} 0.9s ease;
    }
  }
`;

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const RemoveRow = styled.div`
  color: ${colors.colorCoreRed};

  &:hover {
    cursor: pointer;
  }
`;

const TypeBox = styledTS<{ color: string }>(styled.div)`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: ${props => props.color};
  color: white;
  line-height: 28px;
  text-align: center;
  margin-right: 10px;
  font-size: 14px;
  flex-shrink: 0;
`;

const ProductSettings = styled.div`
  flex: 1;
  border-right: 1px solid ${colors.borderPrimary};
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  margin-right: 20px;
  padding-right: 20px;
  margin-top: -16px;
  margin-bottom: -16px;
  padding-top: 16px;
`;

export {
  ProductName,
  FormContainer,
  CategoryContainer,
  FooterInfo,
  CustomField,
  Measure,
  Add,
  ItemText,
  Amount,
  ProductItemContainer,
  ContentRow,
  ContentRowTitle,
  ItemRow,
  ContentColumn,
  ProductButton,
  Divider,
  WrongLess,
  ProductTableWrapper,
  TypeBox,
  NameWrapper,
  ProductSettings,
  RemoveRow
};
