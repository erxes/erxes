import * as React from "react";
import { defaultAvatar } from "../../icons/Icons";
import { IUser } from "../../types";
import { __, readFile } from "../../utils";
import { IKbCategory } from "../types";

type Props = {
  category: IKbCategory;
};

function ItemMeta({ category }: Props) {
  const { authors } = category;

  let text = "";

  function getAuthorDetails(author: IUser) {
    return author.details || { avatar: defaultAvatar, fullName: "" };
  }

  function renderAvatars() {
    const usedIds: string[] = [];

    return authors.map(author => {
      if (usedIds.indexOf(author._id) !== -1) {
        return null;
      }

      usedIds.push(author._id);

      const details = getAuthorDetails(author);

      return (
        <img
          alt={details.fullName}
          key={details.fullName}
          src={readFile(details.avatar)}
        />
      );
    });
  }

  const uIds: string[] = [];

  if (authors.length >= 1) {
    uIds.push(authors[0]._id);
    text = getAuthorDetails(authors[0]).fullName;
  }

  if (authors.length >= 2 && uIds.indexOf(authors[1]._id) === -1) {
    uIds.push(authors[1]._id);
    text += `, ${getAuthorDetails(authors[1]).fullName}`;
  }

  if (authors.length >= 3 && uIds.indexOf(authors[2]._id) === -1) {
    uIds.push(authors[2]._id);
    text += `, ${getAuthorDetails(authors[2]).fullName}`;
  }

  if (authors.length >= 4) {
    text += ` and ${authors.length - 3} people`;
  }

  return (
    <div className="item-meta flex-item">
      <div className="avatars">{renderAvatars()}</div>
      <div>
        <div>
          {__("There are ")} <span>{category.numOfArticles}</span>{" "}
          {__("articles in this category")}
        </div>
        <div>
          {__("Written by")} <span>{text}</span>
        </div>
      </div>
    </div>
  );
}

export default ItemMeta;
