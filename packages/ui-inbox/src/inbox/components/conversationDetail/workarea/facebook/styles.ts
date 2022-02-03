import { colors, typography } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const mainSize = '20px';
const coreSize = '10px';
const borderRadius = '4px';
const textColor = '#1D212A';


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

const Comment = styledTS<{ isInternal?: boolean }>(styled.div)`
  background: ${props => (props.isInternal ? colors.bgInternal : '#eff1f3')};
  box-shadow: ${props =>
    props.isInternal && `0 1px 1px 0 ${colors.darkShadow}`};
  border: 1px solid
    ${props => (props.isInternal ? colors.bgInternal : '#ebebeb')};
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

export {
  PostContainer,
  Comment,
}