import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const FeedLayout = styled.div`
  flex: 1;

  p {
    margin-bottom: 0;
    color: #666;
  }

  .hxZkUW {
    justify-content: center;

    > span {
      min-width: 120px;
      text-align: center;
    }
  }
`;

export const TabContent = styled.div`
  width: 700px;
  margin: 20px auto;
`;

export const ButtonWrap = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const UploadItems = styled.div`
  > div {
    display: flex;
    flex-direction: column-reverse;
  }
`;

export const NewsFeedLayout = styled.div`
  > div {
    margin-bottom: 20px;
    border-radius: 10px;
    box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);

    > img {
      width: 100%;
      border-top: 1px solid #ddd;
    }
  }

  > button {
    border: 1px solid #ddd;
    margin-bottom: 20px;
    &:hover {
      background: rgba(10, 30, 65, 0.08);
    }
  }
`;

export const HeaderFeed = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;

  > div {
    > div {
      > p {
        > b {
          color: green;
        }
      }
    }

    > img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }
`;

export const NavItem = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all ease 0.3s;

  &:hover {
    background-color: #ddd;
    cursor: pointer;
  }

  .dropdown {
    display: table;
    text-align: center;
    width: 40px;
    height: 40px;
    line-height: 40px;
    border-radius: 50%;

    div:first-child {
      display: table-cell;
      vertical-align: middle;
      height: 100%;
    }
  }

  .dropdown-menu {
    min-width: 150px;

    > li,
    > li a {
      height: 30px;
      line-height: 2;
    }
  }
`;

export const FeedActions = styledTS<{ showPin?: boolean | undefined }>(
  styled.div
)`
  display: flex;
  align-items: center;

  > i {
    visibility: ${props => (props.showPin ? 'visible' : 'hidden')};
    color: #e91e27
  }
`;

export const TextFeed = styled.div`
  padding: 0 20px 15px;
`;

export const LikeCommentShare = styled.div`
  display: flex;
  border-top: 1px solid #ddd;
  padding: 10px 20px;

  b {
    margin-right: 20px;
  }
  b:last-of-type {
    margin-left: auto;
    margin-right: 0px;
  }
`;

export const Attachments = styled.div`
  border-top: 1px solid #ddd;
  color: #444;
  font-size: 14px;
  padding: 10px;

  &:hover {
    background: rgba(10, 30, 65, 0.08);
  }
`;

export const MainContent = styled.div`
  padding: 20px;
`;

export const CustomRangeContainer = styled.div`
  margin: 10px 0;
  display: flex;
  align-items: flex-end;

  > span {
    flex: 1;
    margin-right: 8px;

    input[type='text'] {
      border: none;
      width: 100%;
      height: 34px;
      padding: 5px 0;
      color: #444;
      border-bottom: 1px solid;
      border-color: #ddd;
      background: none;
      border-radius: 0;
      box-shadow: none;
      font-size: 13px;
    }
  }
`;

export const FormWrap = styledTS<{ transparent?: boolean }>(styled.div)`
  form {
    padding: 10px 20px;
    background: ${props => !props.transparent && '#f4f4f7'};
    border-radius: 10px;
    border: ${props => !props.transparent && '1px solid #eee'} ;
    margin-bottom: 20px;

    > span,
    .Select {
      display: block;
      margin-bottom: 10px;
    }

    label {
      margin-right: 20px;
    }
  }
`;
