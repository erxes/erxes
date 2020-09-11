import { colors, typography } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const mainSize = '20px';
const coreSize = '10px';
const borderRadius = '4px';
const textColor = '#1D212A';

const FlexItem = styled.div`
  display: flex;
  align-items: flex-end;
`;

const PostContainer = styled.div`
  padding: ${mainSize} ${mainSize} 15px;
  border: 1px solid ${colors.borderDarker};
  overflow: hidden;
  position: relative;
  margin-bottom: 15px;
  background: ${colors.colorWhite};
  border-radius: ${borderRadius};

  > span {
    position: absolute;
    left: ${mainSize};
    top: ${mainSize};
  }

  > p {
    font-size: 13px;
    color: ${textColor};
    border-bottom: 1px solid ${colors.borderPrimary};
    padding-bottom: 5px;
  }

  img {
    margin-bottom: 15px;
    max-width: 100%;
    border-radius: ${borderRadius};
  }
`;

const DateTime = styled.a`
  color: ${colors.colorCoreGray};
  font-size: ${typography.fontSizeHeading8}px;
  font-weight: normal;
  display: initial;

  &:hover {
    text-decoration: underline;
    color: ${colors.colorCoreGray};
  }
`;

const User = styledTS<{ isPost?: boolean; isReply?: string }>(styled.div)`
  color: ${colors.colorCoreGray};
  padding-right: ${mainSize};
  padding-left: ${(props) => (props.isPost ? '50px' : '40px')};
  padding-left: ${(props) => props.isReply && '30px'};

  > a {
    display: block;
    color: ${colors.socialFacebook};
    font-weight: 600;
    font-size: 14px;
    line-height: 1.38;
  }

  > a:hover {
    text-decoration: underline;
    color: #3a5999;
  }

  span {
    color: #616770;
    font-size: ${(props) => (props.isPost ? '12px' : '11px')};
    cursor: pointer;
  }

  span:hover {
    text-decoration: underline;
  }
`;

const ShowMore = styledTS<{ isReply?: boolean }>(styled.a)`
  color: ${colors.socialFacebook};
  font-size: 12px;
  padding: ${(props) => (props.isReply ? '0 0 10px 60px' : '0 0 5px 10px')};
  display: block;
  position: relative;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
    color: ${colors.socialFacebook};
  }

  i {
    transform: rotate(180deg);
    position: absolute;
    font-size: 10px;

    &:before {
      font-weight: bolder;
    }
  }

  span {
    padding-left: 20px;
  }
`;

const Reply = styledTS<{ type: string }>(styled.div)`
  display: inline-block;
  margin-right: 5px;
  padding-left: ${coreSize};
  > span {
    font-size: 11px;
    color: ${(props) => {
      switch (props.type) {
        case 'convert':
          return colors.colorPrimary;
        case 'Resolve':
          return colors.colorCoreGreen;
        case 'Open':
          return colors.colorCoreYellow;
        default:
          return colors.socialFacebook;
      }
    }};
    transition: all ease 0.9s;
    cursor: pointer;
  }

  > span:hover {
    text-decoration: underline;
    color: #3a5999;
  }
`;

const ChildPost = styledTS<{ isReply?: string }>(styled.div)`
  padding: 0 ${coreSize};
  position: relative;
  margin-bottom: 15px;
  margin-left: ${(props) => props.isReply && '45px'};

  > span {
    margin-top: ${(props) => props.isReply && '7px'};
  }
`;

const Counts = styled.div`
  display: flex;
  justify-content: space-between;
  color: #616770;
  font-size: 11px;
  font-weight: 500;

  a {
    padding-left: 5px;
    font-size: 12px;
    color: #616770;
  }
`;

const Comment = styledTS<{ isInternal?: boolean }>(styled.div)`
  background: ${(props) => (props.isInternal ? colors.bgInternal : '#eff1f3')};
  box-shadow: ${(props) =>
    props.isInternal && `0 1px 1px 0 ${colors.darkShadow}`};
  border: 1px solid
    ${(props) => (props.isInternal ? colors.bgInternal : '#ebebeb')};
  padding: 8px ${coreSize};
  border-radius: 18px;
  line-height: 16px;
  font-size: 12px;
  display: inline-block;
  position: relative;
  color: ${textColor};

  > a {
    float: left;
    padding-right: 5px;
    color: ${colors.socialFacebook};
    font-weight: 600;
  }

  > a:hover {
    text-decoration: underline;
    color: #3a5999;
  }

  p {
    margin: 0;
    display: inline;
  }

  img {
    display: block;
    margin-top: 7px;
  }

  iframe {
    padding: ${mainSize};
  }
`;

const Footer = styled.div`
  text-align: right;
`;

const ContentContainer = styledTS<{ full?: boolean; isComment?: boolean }>(
  styled.div
)`
  padding: ${coreSize};

  img {
    width: ${(props) => props.full && '70px'};
    height: ${(props) => props.full && '70px'};
    border: 1px solid ${colors.borderPrimary};
    margin-right: 5px;
    padding: ${coreSize};
    max-width: ${(props) => props.isComment && '400px'};
  }

  > div {
    display: inline;
  }
`;

const LeftAlign = styled.div`
  text-align: left;
  font-size: 11px;
`;

export {
  PostContainer,
  User,
  ChildPost,
  Comment,
  Counts,
  Reply,
  FlexItem,
  Footer,
  ContentContainer,
  LeftAlign,
  DateTime,
  ShowMore,
};
