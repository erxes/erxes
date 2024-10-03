import ActivityInputs from "@erxes/ui-log/src/activityLogs/components/ActivityInputs";
import ActivityLogs from "@erxes/ui-log/src/activityLogs/containers/ActivityLogs";
import { ContainerBox } from "../../../style";
import { IAsset } from "../../../common/types";
import LeftSidebar from "./LeftSidebar";
import React from "react";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "@erxes/ui/src/utils";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  asset: IAsset;
  refetchDetail: () => void;
};
const Detail = (props: Props) => {
  const { asset, refetchDetail } = props;

  const title = asset.name || "Unknown";

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Assets"), link: "/settings/assets" },
    { title }
  ];

  const content = (
    <ContainerBox marginY={20} marginX={20} $column={true}>
      <ActivityInputs
        contentTypeId={asset._id}
        contentType="assets:asset"
        showEmail={false}
      />
      {
        <ActivityLogs
          target={asset.name || ""}
          contentId={asset._id}
          contentType="assets:asset"
          extraTabs={[]}
        />
      }
    </ContainerBox>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      leftSidebar={<LeftSidebar asset={asset} refetchDetail={refetchDetail} />}
      content={content}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default Detail;
