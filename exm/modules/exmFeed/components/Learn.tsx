import {
  LearnBanner,
  LearnItem,
  LearnItemDescription,
  LearnWrapper,
  OverflowRow,
} from "../styles";

import Button from "../../common/Button";
import { IUser } from "../../auth/types";
import Icon from "../../common/Icon";
import Link from "next/link";
import React from "react";
import { __ } from "../../../utils";

type Props = {
  currentUser: IUser;
};

export default function Learn({ currentUser }: Props) {
  const renderItem = (item) => {
    return (
      <LearnItem>
        <div className="image-wrapper">
          <img src={item.image} alt="learn-img" />
        </div>
        <LearnItemDescription>
          <div>
            <span>{__(item.tag)}</span>
            <h6>
              <b>{__(item.title)}</b>
            </h6>
            <p>{__(item.description)}</p>
          </div>
          <footer>
            <Button type="simple">View all</Button>
            <ul>
              <li>
                <img src="/static/learn.jpg" alt="learn-img" />
              </li>
              <li>
                <img src="/static/learn.jpg" alt="learn-img" />
              </li>
              <li>
                <img src="/static/learn.jpg" alt="learn-img" />
              </li>
              <li>
                <img src="/static/learn.jpg" alt="learn-img" />
              </li>
            </ul>
          </footer>
        </LearnItemDescription>
      </LearnItem>
    );
  };

  const renderBanner = () => {
    return (
      <LearnBanner>
        <div style={{ backgroundImage: `url(/static/learn.jpg)` }}>
          <div className="content">
            <div>
              <h5>{__("Work with the Rockets")}</h5>
              <p>
                {__(
                  "Wealth creation is an evolutionarily recent positive-sum game. It is all about who take the opportunity first."
                )}
              </p>
            </div>
            <Link href="#">
              <a>
                {__("Read more")} &emsp;
                <Icon icon="rightarrow" />
              </a>
            </Link>
          </div>
        </div>
      </LearnBanner>
    );
  };

  return (
    <LearnWrapper>
      <h5>{__("Top Lessons")}</h5>
      <p>{__("Architects design houses")}</p>
      <OverflowRow>
        {renderItem({
          image: "/static/learn.jpg",
          tag: "Lesson #1",
          title: "How to Speak So People Want to Listen",
          description:
            "As Uber works through a huge amount of internal management turmoil.",
        })}
        {renderItem({
          image: "/static/learn.jpg",
          tag: "Lesson #1",
          title: "How to Speak So People Want to Listen eople Want to Listen",
          description:
            "As Uber works through a huge amount of internal management turmoil.  works through a huge amount of internal managemen",
        })}
        {renderItem({
          image: "/static/learn.jpg",
          tag: "Lesson #1",
          title: "How to Speak So",
          description: "Aount of internal management turmoil.",
        })}
      </OverflowRow>
      {renderBanner()}
      <OverflowRow>
        {renderItem({
          image: "/static/learn.jpg",
          tag: "Lesson #1",
          title: "How to Speak So People Want to Listen",
          description:
            "As Uber works through a huge amount of internal management turmoil.",
        })}
        {renderItem({
          image: "/static/learn.jpg",
          tag: "Lesson #1",
          title: "How to Speak So People Want to Listen eople Want to Listen",
          description:
            "As Uber works through a huge amount of internal management turmoil.  works through a huge amount of internal managemen",
        })}
        {renderItem({
          image: "/static/learn.jpg",
          tag: "Lesson #1",
          title: "How to Speak So",
          description: "Aount of internal management turmoil.",
        })}
      </OverflowRow>
    </LearnWrapper>
  );
}
