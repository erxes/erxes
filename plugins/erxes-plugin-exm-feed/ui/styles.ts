import styled from 'styled-components';

export const FeedLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const TabLayout = styled.div`
  overflow: hidden;
  width: 600px;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 0 5px 0 rgb(0 0 0 / 8%);
  height: max-content;
  margin-top: 30px;

  > div:first-child {
    border: none;
    span {
      display: flex;
      border-radius: 10px;
      box-shadow: 0 0 5px 0 rgb(0 0 0 / 8%);
      width: 110px;
      padding: 10px 10px;
      justify-content: space-between;
      align-items: center;

      :before {
        width: 60%;
        left: 20%;
      }
    }
  }
`;

export const FormContainer = styled.div`
  margin-top: 15px;
  padding: 0px 26px;
  flex: 1;
`;

export const ItemUpload = styled.div`
  display: flex;
  > div {
    display: flex;
    align-items: center;
    > div {
      margin: 0;
    }
  }
`;

export const NewsFeedLayout = styled.div`
  width: 600px;
  li {
    list-style-type: none;
    margin-top: 30px;
    border-radius: 10px;
    padding: 15px;
    box-shadow: 0 0 5px 0 rgb(0 0 0 / 8%);
  }
`;

export const HeaderFeed = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const FirstSection = styled.div`
  display: flex;
  img {
    width: 36px;
    height: 36px;
    margin-top: 3px;
    border-radius: 50%;
  }
`;

export const NavItem = styled.div`
  width: 36px;
  height: 36px;
  margin-top: 3px;
  border-radius: 50%;

  &:hover {
    background-color: #DDD;
    cursor: pointer;
  }

  .dropdown {
    display: table;
    text-align: center;
    width: 36px;
    height: 36px;
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

export const TypeOfContent = styled.div`
  > p {
    margin-bottom: 0px;
  }
`;

export const BodyFeed = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;

  b {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  img {
    border-radius: 20px;
  }

`;

export const Attachments = styled.div`
  a {
    display: flex;
  }

  &:hover {
    background: rgba(10,30,65,0.08);
    cursor: pointer;
  }
`;

export const AttachmentsIcon = styled.div`
  width: 100px;
  border-radius: 4px;
  font-size: 36px;
  padding: 20px;
  text-align: center;
  color: #6569DF;
  background: rgba(10,30,65,0.08);
`;

export const AttachmentsTitle = styled.div`
  padding: 20px 30px;
  font-size: 14px;
  color: black;
  align-items: center;
`;