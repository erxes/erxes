import styled from 'styled-components';
import { colors } from '../common/styles';
import { lighten } from '../common/styles/color';

const AuthBox = styled.div`
  background-color: #fff;
  padding: 50px;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  border-radius: 17px;
  max-width: 490px;
  margin: 0 auto;
  .logo {
    margin-bottom: 40px;
    text-align: left;
  }
  h2 {
    color: #6b60a6;
    font-size: 30px;
    font-weight: 400;
    margin: 0 0 50px;
  }
  .form-group {
    margin-bottom: 10px;
    .input-group-btn:first-child > .btn {
      padding: 15px 20px;
      min-width: 53px;
      &:focus,
      &:hover {
        outline: 0;
        background: transparent;
        cursor: default;
      }
      i {
        color: ${colors.colorPrimaryLight};
      }
    }
    input {
      outline: 0;
      box-shadow: none;
      padding: 15px 30px;
      height: auto;
      &:focus {
        outline: 0;
        box-shadow: none;
        border-color: #6b60a6;
      }

      &:-webkit-autofill {
        background: none;
      }
    }
  }

  button[type='submit'] {
    transition: background 0.2s ease;
    background-color: ${colors.colorPrimaryLight};
    color: #fff;
    text-transform: uppercase;
    font-weight: 600;
    border: 0;
    padding: 15px;
    border-radius: 10px;
    &:hover,
    .active.focus,
    .active:focus,
    .focus,
    :active.focus,
    :active:focus,
    :focus {
      background-color: ${lighten(colors.colorPrimary, 5)};
      color: #fff;
    }
  }
`;

const Links = styled.div`
  padding: 15px 0 25px 0;
  margin-bottom: 25px;
  text-align: center;
  border-bottom: ${colors.borderDarker} solid 1px;
  a {
    color: ${colors.colorCoreBlack};
  }
`;

const ProfileWrapper = styled.div`
  position: relative;

  img {
    display: block;
    width: 100px;
    height: 100px;
    border-radius: 50px;
  }
`;

const ProfileRow = styled.div`
  display: flex;
  flex: 2;

  > div {
    flex: 1;

    &:not(:last-child) {
      margin-right: 20px;
    }
  }
`;

export { AuthBox, Links, ProfileWrapper, ProfileRow };
