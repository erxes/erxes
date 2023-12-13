import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const Features = styledTS<{ isToggled: boolean }>(styled.span)`
  transition: all ease .3s;
  filter: ${props => !props.isToggled && `blur(4px)`};
  pointer-events: ${props => !props.isToggled && `none`};
`;

export const PagesContainer = styled.div`
  display: flex;
  flex-direction: column;

  > div {
    flex: 1;
    display: flex;
    gap: 20px;
    align-items: center;

    > label {
      > span {
        margin-top: 0;
      }
    }
  }

  > div::last-of-type {
    margin-right: 10px;
  }
`;
