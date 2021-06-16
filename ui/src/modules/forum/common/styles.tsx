import styled from 'styled-components';
import { colors, typography } from 'erxes-ui';

const FlexWrapper = styled.span`
  flex: 1;
`;

const DateContainer = styled.div`
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

export { FlexWrapper, DateContainer };
