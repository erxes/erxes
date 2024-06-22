import { colors } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const Features = styledTS<{ isToggled: boolean }>(styled.span)`
  transition: all ease .3s;
  filter: ${(props) => !props.isToggled && `blur(4px)`};
  pointer-events: ${(props) => !props.isToggled && `none`};
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

const lasStepStyle = `
    width: 100%;
    height: 80px;
    border-bottom: 1px solid #344054;
    align-items: center;
    margin-top: 30px;
    padding: 10px 20px;
    gap: 10px;

    > img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }
    
    > p {
      font-size: 14px;
      font-weight: 800;
      margin: 0;
    }
`;

const getStartedStyle = `
flex-direction: column;
    gap: 15px;
    padding-top: 100px;
    align-items: center;
    > img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
    }
    > p {
      font-size: 18px;
      font-weight: 500;
    }
`;

export const MobileEmulator = styledTS<{
  disabled?: boolean;
  isLastStep?: boolean;
}>(styled.div)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 630px;
  width: 350px;
  border-radius: 50px;
  background-color: #232b39;
  border: 12px solid #181e28;
  overflow: auto;
  color: white;

  > span {
    ${({ disabled }) => (disabled ? 'pointer-events: none;' : '')}
    position: absolute;
    bottom: 0;
    padding: 20px;
    text-align: center;
  }

  .profile {
    display: flex;
    ${({ isLastStep }) => (!isLastStep ? getStartedStyle : lasStepStyle)}
  }

  .getStarted {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding-top: 50px;

    > p {
      font-size: 14px;
      color: #b0b3b8;
      width:250px;
      word-wrap: break-word;
      text-align: center;
    }

    > span {
      font-size: 14px;
      color: #b0b3b8;
    }

    > button {
      background-color: #181e28;
      border-radius: 25px;
      font-size: 16px;
      color: #b0b3b8;
      border: 0;
      cursor: pointer;
      padding: 5px 10px;
    }
  }

  &::-webkit-scrollbar {
    width: 0;
  }

  .top-bar {
    width: 320px;
    display: flex;
    justify-content: center;
    padding-top: 10px;
    padding-bottom: 30px;
    position: fixed;

    .dynamic-island {
      height: 20px;
      width: 80px;
      border-radius: 15px;
      background-color: #181e28;
    }
  }

  .content {
    flex: 1;
    width: 100%;
    display: flex;
    flex-flow: column-reverse;
    
    .message-row {
      display: flex;
      flex-flow: row-reverse;
      align-items: end;
      gap: 10px;

      > span {
        background-color: ${colors.colorCoreBlue};
        padding: 10px 20px;
        border-radius: 15px;
        max-width:200px;
        word-wrap: break-word;
      }
    }

    .inputField{
      width:100%;
      display: flex;
      gap:10px;
      padding: 10px;
      border-radius: 10px;
      background-color: #232b39;

      > input {
        flex: 1;
        background-color: #1d2939;
        border:1px solid #344054;
        border-radius:10px;
        padding: 10px;
      }

      > input:focus{
        background-color: #181e28;
      }

      > button {
        background-color: #1d2939;
        border:1px solid #344054;
        border-radius:10px;
        padding: 0 20px;
        cursor: pointer;
      }

    }
  }

  .persistentMenu {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: start;
    max-height: 250px;
    bottom: 0;
    background-color: #1d2939;
    border-top: 1px solid #344054;
    border-radius: 25px;
    min-height: 150px;
    overflow: auto;

    .dragger {
      width: 50px;
      display: flex;
      align-self: center;
      height: 5px;
      background-color: #3b4149;
      border-radius: 15px;
      margin: 5px;
      margin-bottom: 15px;
      position: fixed;
      cursor: pointer;
    }

    > ul {
      width: 100%;
      padding-right: 40px;
      margin: 0;
      padding-top: 30px;

      > li:first-child {
        border-top: 0;
      }

      > li {
        padding: 10px;
        width: 100%;
        list-style-type: none;
        cursor: pointer;
        border-top: 1px solid #344054;
        font-size: 15px;
      }
    }
  }
`;

export const EmulatorWrapper = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
`;
