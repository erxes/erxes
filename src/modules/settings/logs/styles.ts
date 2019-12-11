import { colors, typography } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FilterWrapper = styled.div`
  padding: 5px 0;
  display: flex;
  flex-wrap: wrap;
`;

const FilterItem = styled.div`
  position: relative;
  float: left;
  min-width: 200px;
  margin-right: 20px;

  .form-control {
    box-shadow: none;
    border-radius: 0;
    border: none;
    background: none;
    border-bottom: 1px solid ${colors.colorShadowGray};
    padding: 5px 0;
    font-size: ${typography.fontSizeBody}px;

    &:focus {
      box-shadow: none;
      border-color: ${colors.colorSecondary};
    }
  }
`;

const LogBox = styledTS<{ color?: string }>(styled.div)`
  border: 1px dotted ${props =>
    props.color ? props.color : colors.colorPrimary};
  padding: 5px;
  margin: 5px;

  .field-name {
    font-weight: 500;
  }

  .field-value {
    padding-left: 10px;
    font-weight: 700;
    color: ${props => (props.color ? props.color : colors.colorPrimary)}
  }
`;

export { FilterWrapper, FilterItem, LogBox };
