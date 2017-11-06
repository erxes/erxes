import styled from 'styled-components';

const AuthContent = styled.div`
  position: relative;
  top: 50%;
  transform: translateY(-50%);
`;

const AuthDescription = styled.div`
  margin-top: 60px;
  img {
    width: 100px;
    margin-bottom: 50px;
  }
  h1 {
    font-weight: 700;
    font-size: 32px;
    margin-bottom: 30px;
    color: #fff;
  }
  p {
    color: #c9b6e8;
    margin-bottom: 50px;
    font-size: 16px;
    line-height: 1.8em;
  }
  a {
    color: #c9b6e8;
  }
  .not-found {
    margin-top: 0;
  }
`;

const AuthBox = styled.div`
  background-color: #fff;
  padding: 70px 60px;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);

  h2 {
    color: #6b60a6;
    font-size: 30px;
    font-weight: 400;
    margin: 0 0 50px;
  }

  input {
    border: 0;
    border-bottom: 1px solid #ac8fdc;
    padding: 0 0 6px;
    color: #6b60a6;
    border-radius: 0;
    font-size: 16px;
    outline: 0;
    box-shadow: none;

    &:focus {
      outline: 0;
      box-shadow: none;
      border-color: #6b60a6;
    }

    &:-webkit-autofill {
      background: none;
    }
  }

  button {
    transition: background 0.2s ease;
    background-color: #6b60a6;
    color: #fff;
    text-transform: uppercase;
    font-weight: 600;
    margin-top: 50px;
    border: 0;

    &:hover,
    .active.focus,
    .active:focus,
    .focus,
    :active.focus,
    :active:focus,
    :focus {
      background-color: #8981b8;
      color: #fff;
    }
  }
`;

const Links = styled.div`
  margin-top: 70px;
  text-align: center;
`;

const ProfileWrapper = styled.div`
  position: relative;
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

export {
  AuthContent,
  AuthDescription,
  AuthBox,
  Links,
  ProfileWrapper,
  ProfileRow
};
