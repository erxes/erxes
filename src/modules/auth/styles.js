import styled from 'styled-components';

const AuthContent = styled.div`
  position: relative;
  top: 50%;
  transform: translateY(-50%);
`;
const Container = styled.div.attrs({
  className: 'container'
})``;
const Divcolmd7 = styled.div.attrs({
  className: 'col-md-7'
})``;
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
const Divcolmd5 = styled.div.attrs({
  className: 'col-md-5'
})``;
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
  }
  button {
    -webkit-transition: background 0.2s ease;
    -moz-transition: background 0.2s ease;
    -ms-transition: background 0.2s ease;
    -o-transition: background 0.2s ease;
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
export {
  AuthContent,
  Container,
  Divcolmd7,
  AuthDescription,
  Divcolmd5,
  AuthBox
};
