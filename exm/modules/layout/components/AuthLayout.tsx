import {
  AuthBox,
  AuthContent,
  AuthDescription,
  AuthItem,
  AuthWrapper,
  Footer,
} from "../styles";

import Link from "next/link";
import React from "react";
import { __ } from "../../../utils";
import { bustIframe } from "../../utils";

type Props = {
  content: React.ReactNode;
};

class AuthLayout extends React.Component<Props, {}> {
  componentDidMount() {
    // click-jack attack defense
    bustIframe();
  }

  renderCover() {
    return (
      <AuthDescription>
        <img src="/static/logos/erxes-logo-white.svg" />
      </AuthDescription>
    );
  }

  renderFooter() {
    return (
      <Footer>
        <span>
          @ {new Date().getFullYear()}, Made with ❤️ by <b>erxes Team</b> for a
          better web
        </span>
        <ul>
          <li>
            <Link href={"#"}>Blog</Link>
          </li>
          <li>
            <Link href={"#"}>License</Link>
          </li>
        </ul>
      </Footer>
    );
  }

  render() {
    const { content } = this.props;

    return (
      <AuthWrapper>
        <AuthBox>
          <AuthItem order={1}>
            <AuthContent>{content}</AuthContent>
          </AuthItem>
          {this.renderCover()}
        </AuthBox>
        {this.renderFooter()}
      </AuthWrapper>
    );
  }
}

export default AuthLayout;
