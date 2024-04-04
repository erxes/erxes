import React from "react";
import { colors } from "../../styles";
import { readFile } from "../utils";
import { renderUserFullName } from "../../utils";
import { rgba } from "../../styles/ecolor";
import styled from "styled-components";
import styledTS from "styled-components-ts";

const AvatarStyled = styledTS<{ state?: string }>(styled.span)`
  display: block;
  max-width: 80px;
  border-radius: 40px;
  float: left;
  padding: 0;
  text-align: center;
  position: relative;
  color: ${colors.colorWhite};

  background: ${(props) =>
    (props.state === "lead" && rgba(colors.colorCoreYellow, 0.8)) ||
    (props.state === "visitor" && rgba(colors.colorLightGray, 0.6)) ||
    (props.state === "customer" && rgba(colors.colorCoreTeal, 0.8)) ||
    rgba(colors.colorSecondary, 0.8)};

  > span {
    position: absolute;
    right: -5px;
    bottom: -2px;
  }

  a {
    color: ${colors.colorWhite};
    display: block;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.colorWhite};
      opacity: 0.8;
    }
  }
`;

const AvatarImage = styledTS<{ image?: string }>(styled.div)`
  background: url(${(props) =>
    props.image ? `"${props.image}"` : "/static/avatar-colored.svg"})
    center no-repeat;
  background-size: cover;
`;

type Props = {
  user?;
  customer?;
  company?;
  size?: number;
  icon?: React.ReactNode;
  letterCount?: number;
};

function Element({
  children,
  customer,
}: {
  children: React.ReactNode;
  customer?;
}) {
  return <div>{children}</div>;
}

class Avatar extends React.Component<Props> {
  generateStyle(size: number = 40) {
    return {
      width: size,
      height: size,
      lineHeight: `${size}px`,
      borderRadius: `${size}px`,
      fontSize: `${size / 3}px`,
      fontWeight: 600,
    };
  }

  renderImage(src: string) {
    const { size } = this.props;
    return (
      <AvatarImage image={readFile(src)} style={this.generateStyle(size)} />
    );
  }

  generateTypes() {
    const { customer } = this.props;

    if (customer) {
      return {
        state: customer.state,
      };
    }

    return {
      state: true,
    };
  }

  renderInitials(fullName) {
    const { size, letterCount = 2 } = this.props;

    const initials = fullName ? (
      fullName
        .split(" ")
        .slice(0, letterCount)
        .map((s) => s.charAt(0))
        .join(".")
        .toUpperCase()
    ) : (
      <AvatarImage style={this.generateStyle(size)} />
    );

    return <div style={this.generateStyle(size)}>{initials}</div>;
  }

  renderCustomerName(customer) {
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    }

    return (
      customer.firstName ||
      customer.lastName ||
      customer.name ||
      customer.middleName ||
      null
    );
  }

  render() {
    const { user, customer, company, icon } = this.props;

    let avatar;
    let fullName;

    if (user) {
      avatar = user && user.avatar;
      fullName = renderUserFullName(user);
    }

    if (customer) {
      avatar = customer.avatar;
      fullName = this.renderCustomerName(customer);
    }

    if (company) {
      avatar = company.avatar;
      fullName = company.primaryName || null;
    }

    return (
      <AvatarStyled state={customer && customer.state}>
        <Element customer={customer}>
          {avatar ? this.renderImage(avatar) : this.renderInitials(fullName)}
        </Element>
        {icon}
      </AvatarStyled>
    );
  }
}

export default Avatar;
