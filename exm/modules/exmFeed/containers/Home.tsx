import Home from "../components/Home";
import { IUser } from "../../auth/types";
import React from "react";
import { queries } from "../graphql";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import dayjs from "dayjs";

type Props = {
  queryParams: any;
  currentUser: IUser;
};

export default function HomeContainer(props: Props) {
  const events = useQuery(gql(queries.feed), {
    variables: {
      contentTypes: ["event"],
    },
  });

  const today = dayjs(new Date()).format("YYYY-MM-DD");

  const todayEvents =
    events.data &&
    events.data.exmFeed &&
    events.data.exmFeed.list.map((e) => {
      if (
        dayjs(e.eventData.startDate).format('YYYY-MM-DD') <= today &&
        today <= dayjs(e.eventData.endDate).format('YYYY-MM-DD')
        ) {
          return e;
        }

      return null;
    });

  const checkedTodaysEvent = (todayEvents || []).map((e) => {
    if (
      (e?.eventData?.visibility === "private" &&
        e?.recipientIds.includes(props.currentUser._id)) ||
      e?.eventData?.visibility === "public"
    ) {
      return e;
    }

    return null;
  });

  return <Home todayEvents={checkedTodaysEvent} {...props} />;
}
