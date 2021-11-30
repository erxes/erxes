import { colors, dimensions } from 'modules/common/styles';
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

const Attributes = styled.ul`
  list-style: none;
  margin: 0;
  right: 20px;
  max-height: 200px;
  min-width: 200px;
  overflow: auto;
  padding: ${dimensions.unitSpacing}px;
  border-radius: ${dimensions.unitSpacing - 5}px;

  > div {
    padding: 0;
  }

  b {
    margin-bottom: ${dimensions.unitSpacing + 10}px;
    color: black;
  }

  li {
    color: ${colors.colorCoreGray};
    padding-bottom: ${dimensions.unitSpacing - 5}px;
    cursor: pointer;
    font-weight: 400;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.textPrimary};
    }
  }
`;

export { Verify, ContentDisabler, Attributes };
