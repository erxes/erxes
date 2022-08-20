import React from "react";
import { IUser, IUserDetails } from "../types";
import dayjs from "dayjs";
import { Avatars } from "../knowledgeBase/components/styles";
import { readFile } from "./utils";

type Props = {
  user: IUser;
  date: Date;
};

export default function Avatar({ user = {} as IUser, date }: Props) {
  const { details = {} as IUserDetails } = user;
  const { fullName, avatar } = details;

  return (
    <Avatars>
      <img
        className="round-img"
        alt={fullName}
        src={readFile(avatar)}
        width="42px"
        height="42px"
      />
      <div className="detail avatar-info">
        <div> Written by: &nbsp;{fullName}</div>
        <div>
          Modified: &nbsp;
          <span>{dayjs(date).format("MMM D YYYY")}</span>
        </div>
      </div>
    </Avatars>
  );
}
