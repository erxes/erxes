import styled from 'styled-components';
import { colors } from '../common/styles';

const FormWrapper = styled.div`
  margin: 0 auto;
  max-height: 65vh;
`;

const InputsWrapper = styled.div`
  float: left;
  width: 60%;
  min-height: 55vh;
  max-height: 55vh;
  overflow-y: auto;
  padding-right: 10px;
  border-right: 1px solid #ddd;

  input {
    position: fixed;
    width: 55%;
  }

  ul {
    margin-top: 10px;
    padding-left: 10px !important;
    list-style-type: none;

    li {
      padding: 5px;

      i {
        color: ${colors.colorCoreDarkGray};
        right: 1px;
        float: left;
        margin-right: 20px;

        &:hover {
          cursor: pointer;
        }
      }
    }
    }
  }
`;

const ListWrapper = styled.div`
  float: right;
  padding-left: 10px;
  width: 40%;
  min-height: 55vh;
  max-height: 55vh;
  overflow-y: auto;

  ul {
    padding: 0 !important;
    list-style-type: none;

    li {
      margin-top: 5px;
      border: 1px solid ${colors.borderPrimary};
      padding: 5px;
      width: 100%;

      i {
        color: ${colors.colorCoreDarkGray};
        right: 1px;
        float: right;

        &:hover {
          cursor: pointer;
        }
      }
    }
  }
`;

const TitleSpan = styled.span`
  margin-top: 10px;
  font-weight: bold;
`;

const Footer = styled.div`
  span {
    margin-bottom: 10px;
    display: block;
    text-align: left;
    a {
      color: ${colors.colorPrimary};

      &:hover {
        cursor: pointer;
      }
    }
  }
`;

const LoadMore = styled.li`
  border: 1px solid ${colors.borderPrimary};
  font-weight: bold;
  text-align: center;

  &:hover {
    cursor: pointer;
  }
`;

export { FormWrapper, InputsWrapper, ListWrapper, TitleSpan, Footer, LoadMore };
