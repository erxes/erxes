import styled from 'styled-components';

export const FeedLayout = styled.div`
  width: 690px;
  p {
    margin-bottom: 0;
  }
  > div:first-child {
    border-left: 1px solid #DDD;
    border-right: 1px solid #DDD;
  }

  > div:nth-child(3) {
    > div:first-child {
      border: 1px solid #DDD;
      margin-bottom: 20px;
      border-radius: 10px;
      > span:first-child {
        > div:first-child {
          margin-left: 10px;
        }
      }
    }
  }

  form {
    border: 1px solid #DDD;
    margin-bottom: 20px;
    padding: 10px;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    display: flex;
    flex-direction: column;
    button {
      margin-top: 10px;
      align-self: end;
    }
  }

`;

export const UploadItems = styled.div`
  margin-top: 10px;
  > div {
    display: flex;
    flex-direction: column-reverse;
  }
`;

export const NewsFeedLayout = styled.div`
  > div {
    border: 1px solid #DDD;
    margin-bottom: 20px;
    border-radius: 10px;
    > img {
      width: 100%;
      border-top: 1px solid #DDD;
    }
  }

  > button {
    border: 1px solid #DDD;
    margin-bottom: 20px;
    &:hover {
      background: rgba(10,30,65,0.08);
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
    background-color: #DDD;
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
  border-top: 1px solid #DDD;
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
  border-top: 1px solid #DDD;
  color: #444;
  font-size: 14px;
  padding: 10px;
  &:hover {
    background: rgba(10,30,65,0.08);
  }
`;
