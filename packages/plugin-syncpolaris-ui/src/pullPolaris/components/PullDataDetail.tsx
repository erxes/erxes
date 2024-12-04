import { CollapseContent, __ } from "@erxes/ui/src";
import { Box } from "@erxes/ui/src/components/step/style";
import React from "react";

type Props = {
  pullData: any;
};

export default function PullDataDetail(props: Props) {
  const { pullData } = props;
  const { response } = pullData;

  const renderResponse = () => {
    if (Array.isArray(response)) {
      return (
        response.map(r => (
          <CollapseContent
            title={__(`${r['acntCode']}`)}
            key={r.acntCode}
          >
            {
              Object.keys(r).map(key => (
                <span key={key}>{key}: {r[key]}</span>
              ))
            }
          </CollapseContent>
        ))
      );
    }
    return (
      Object.keys(response).map(key => (
        <span key={key}>{key}: {response[key]}</span>
      ))
    )
  }

  return (
    <Box hasShadow={true}>
      {renderResponse()}
    </Box>
  );
}
