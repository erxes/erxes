import React from "react";
import Link from "next/link";
import Icon from "./Icon";
import styled from "styled-components";

type Props = {
  title: string;
  category?: any;
};

const Wrapper = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;

  span {
    display: inline-block;
    font-size: 14px;

    &.link {
      cursor: pointer;
      color: #6c718b;
      margin-right: 5px;
    }
  }

  i {
    margin-right: 5px;
  }
`;

const Breadcrumb = (props: Props) => {
  const { title, category } = props;

  return (
    <Wrapper>
      <Link href="/">
        <span className="link">All categories</span>
      </Link>

      {category && (
        <>
          <Icon icon="angle-right" />
          <Link href={`/knowledge-base/category?id=${category._id}`}>
            <span className="link">{category.title}</span>
          </Link>
        </>
      )}

      <Icon icon="angle-right" />
      <span>{title}</span>
    </Wrapper>
  );
};

export default Breadcrumb;
