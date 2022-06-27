import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import {
  VerticalContent,
  RightSidebarWrapper,
  DetailCard,
  MemberPic,
  Information,
  SmallText,
  ColorHeader
} from '../../styles';

type Props = {
  plugin?: {};
};

export default class RightSidebar extends React.Component<Props> {
  renderMembers() {
    return (
      <RightSidebarWrapper>
        <ColorHeader>Creater</ColorHeader>
        <DetailCard>
          <MemberPic>
            <img src="/images/glyph_dark.png" alt="creator"></img>
          </MemberPic>
          <Information>
            <b>Erxes Inc</b>
            <SmallText withMargin>6525 Woodman Avenue, Los Angeles</SmallText>
            <SmallText>California, USA, 91401</SmallText>
            <SmallText withMargin>Tel: +1 617 506 9010</SmallText>
            <SmallText>Email: info@erxes.io</SmallText>
          </Information>
        </DetailCard>
      </RightSidebarWrapper>
    );
  }

  renderShare() {
    return (
      <RightSidebarWrapper>
        <ColorHeader>Useful links</ColorHeader>
        <Button
          href="https://github.com/erxes/erxes"
          target="_blank"
          btnStyle="simple"
        >
          <Icon icon="github-circled" size={16} />
          Github
        </Button>
        <Button
          href="https://www.facebook.com/erxesHQ"
          target="_blank"
          btnStyle="simple"
        >
          <Icon icon="facebook-official" size={16} />
          Facebook
        </Button>
        <Button
          href="https://twitter.com/erxesHQ"
          target="_blank"
          btnStyle="simple"
        >
          <Icon icon="twitter-alt" size={16} />
          Twitter
        </Button>
      </RightSidebarWrapper>
    );
  }

  render() {
    return (
      <VerticalContent>
        {this.renderMembers()}
        {this.renderShare()}
        <Button
          href="https://github.com/erxes/erxes/issues"
          target="_blank"
          block
          style={{ padding: '16px' }}
        >
          <b>Report an issue</b>
        </Button>
      </VerticalContent>
    );
  }
}
