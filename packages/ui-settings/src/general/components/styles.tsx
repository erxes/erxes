import { colors, dimensions } from '@erxes/ui/src/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

const Verify = styled.div`
  display: flex;
  align-items: center;
  margin: ${dimensions.coreSpacing}px 0;

  > * {
    margin-left: ${dimensions.unitSpacing}px;
  }

  > i {
    color: ${colors.colorPrimary};
    margin: 0 ${dimensions.unitSpacing}px 0;
  }

  label {
    margin: 0;
  }
`;

const ContentDisabler = styledTS<{ disable: boolean }>(styled.div)`
  ${props =>
    props.disable &&
    css`
      opacity: 0.5;
      cursor: not-allowed;

      input {
        pointer-events: none;
      }
    `};
`;

export { Verify, ContentDisabler };
