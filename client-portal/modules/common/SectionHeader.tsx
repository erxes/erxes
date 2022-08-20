import React from "react";
import Link from "next/link";
import styled from "styled-components";
import Icon from "./Icon";

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

const SectionHeader = (props) => {
  const { categories, selectedCat } = props;
  let subCats;

  if (categories && categories.length > 0) {
    subCats = categories.find((cat) =>
      cat.childrens.find((child) => child._id === selectedCat._id)
    );
  }

  const renderCat = (cat) => {
    if (!cat) {
      return null;
    }

    if (cat) {
      return (
        <>
          <Icon icon="angle-right" />
          <Link href={`/knowledge-base/category?id=${cat._id}`}>
            <span>{cat.title}</span>
          </Link>
        </>
      );
    }
  };

  return (
    <Wrapper>
      <Link href="/">
        <a>
          <span className="link">All categories</span>
          {renderCat(subCats)}
          {renderCat(selectedCat) || ""}
        </a>
      </Link>
    </Wrapper>
  );
};

export default SectionHeader;
