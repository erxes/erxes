import { colors } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FormContainer = styled.div`
  background: ${colors.colorWhite};
  margin: -40px -40px -30px -40px;
`;

const Footer = styled.div`
  padding: 20px;
  background: ${colors.bgActive};
`;

const FooterInfo = styled.div`
  overflow: hidden;
  padding-bottom: 10px;
  > div {
    &:first-child {
      float: left;
      width: 60%;
    }
  }
  table {
    float: right;
    width: 30%;
    td {
      vertical-align: top;
      padding: 5px;
    }
  }
`;

const Add = styled.div`
  display: block;
  padding: 20px;
  text-align: center;
  border-top: 1px solid ${colors.borderPrimary};
`;

const ItemText = styledTS<{ align?: string }>(styled.div)`
  height: 34px;
  line-height: 34px;
  font-weight: bold;
  padding-left: 10px;
  text-align: ${props => props.align || 'left'};
`;

export { FormContainer, Footer, FooterInfo, Add, ItemText };
