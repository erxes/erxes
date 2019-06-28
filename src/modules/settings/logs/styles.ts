import { colors, typography } from 'modules/common/styles';
import styled from 'styled-components';

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

export { FilterWrapper, FilterItem };
