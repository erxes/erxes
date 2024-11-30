import { CollapseContent, Table, __ } from "@erxes/ui/src";
import dayjs from "dayjs"
import React from "react";

type Props = {
  pullData: any;
};

import { Box } from "@erxes/ui/src/components/step/style";

export default function PullDataDetail(props: Props) {
  const { pullData } = props;
  const { response } = pullData;

  const renderResponse = () => {
    if (Array.isArray(response)) {
      return (
        response.map(r => (
          <CollapseContent
            title={__(`${r['acntCode']}`)}
          >
            {
              Object.keys(r).map(key => (
                <span>{key}: {r[key]}</span>
              ))
            }
          </CollapseContent>
        ))
      );
    }
    return (
      Object.keys(response).map(key => (
        <span>{key}: {response[key]}</span>
      ))
    )
  }

  return (
    <>
      <Box hasShadow={true}>
        {renderResponse()}
      </Box>
    </>
  );
}