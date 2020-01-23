import * as React from "react";
import { Category } from "../containers";
import { IKbTopic } from "../types";

type Props = {
  kbTopic?: IKbTopic;
};

export default function Categories({ kbTopic }: Props) {
  if (!kbTopic) {
    return null;
  }

  return (
    <div>
      {kbTopic.categories.map(category => (
        <Category key={category._id} category={category} />
      ))}
    </div>
  );
}
