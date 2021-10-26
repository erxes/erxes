import styled from "styled-components";

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

  form {
    padding: 10px 20px;
    background: #f4f4f7;
    border-radius: 10px;
    border: 1px solid #eee;
    margin-bottom: 20px;

    > span {
      display: block;
      margin-bottom: 10px;
    }
  }
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
    border: 1px solid #ddd;
    margin-bottom: 20px;
    border-radius: 10px;
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
  padding: 10px;

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
`;

export const NavItem = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-left: auto;
  &:hover {
    background-color: #ddd;
    cursor: pointer;
  }

  .dropdown {
    display: table;
    text-align: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;

    div:first-child {
      display: table-cell;
      vertical-align: middle;
      height: 100%;
    }
  }

  .dropdown-menu {
    min-width: 150px;
    li {
      margin-top: 0;
      margin-bottom: 0;
      padding: 0;
      box-shadow: none;
      border-radius: 0;
    }
  }
`;

export const TextFeed = styled.div`
  padding: 10px;
`;

export const LikeCommentShare = styled.div`
  display: flex;
  border-top: 1px solid #ddd;
  padding: 10px;
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
