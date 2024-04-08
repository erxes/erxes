import * as compose from "lodash.flowright";

import Component from "../components";
import React from "react";
import { withProps } from "@erxes/ui/src/utils/core";

type Props = {};

function Settings({}: Props) {
  return <Component />;
}

export default withProps<Props>(compose()(Settings));
