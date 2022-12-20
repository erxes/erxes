import { colors, dimensions } from '@erxes/ui/src/styles';

import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const TemplateBox = styled.div`
  width: 100%;
  height: 140px;
  border-radius: 2px;
  border: 1px solid ${colors.borderDarker};
  position: relative;
  margin: 10px 0 15px 0;
`;

const HeaderContent = styled.div`
  > div {
    margin: 14px 0 5px 0;
  }

  p {
    color: ${colors.colorCoreGray};
    margin-bottom: 15px;
    font-size: 14px;
  }
`;

const Actions = styled.div`
  background: ${rgba(colors.colorBlack, 0.7)};
  display: flex;
  position: absolute;
  opacity: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  border-radius: 2px;
  transition: opacity ease 0.3s;
  justify-content: space-evenly;
  align-items: center;
  color: ${colors.bgLight};

  div,
  a {
    cursor: pointer;
    color: inherit;

    i {
      margin-right: 3px;
    }

    &:hover {
      font-weight: 500;
      transition: all ease 0.3s;
    }
  }
`;

export { Actions, TemplateBox, HeaderContent };
