import { IUser, IUserDetails } from "../types";

import { Avatars } from "../knowledgeBase/components/styles";
import Icon from "./Icon";
import React from "react";
import dayjs from "dayjs";
import { readFile } from "./utils";

type Props = {
  user: IUser;
  date: Date;
  viewCount: number;
};

export default function Avatar({ user = {} as IUser, date, viewCount }: Props) {
  if (!user || !user.details) {
    return null;
  }

  const { details = {} as IUserDetails } = user;
  const { fullName, avatar } = details;

  return (
    <Avatars>
      <img
        className="round-img"
        alt={fullName}
        src={avatar ? readFile(avatar) : "/static/avatar-colored.svg"}
      />
      <div className="detail avatar-info d-flex flex-wrap">
        <div>
          Written by
          <span>{fullName}</span>
        </div>
        <div>
          Modified at
          <span>{dayjs(date).format("MMM D YYYY")}</span>
        </div>
        <div className="d-flex align-items-center">
          <Icon icon="eye" size={14} />
          <span>{viewCount}</span>
        </div>
      </div>
    </Avatars>
  );
}
