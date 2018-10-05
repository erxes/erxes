import { EmptyState } from "modules/common/components";
import { __ } from "modules/common/utils";
import { Sidebar } from "modules/inbox/containers/leftSidebar";
import { Wrapper } from "modules/layout/components";
import * as React from "react";

type Props = {
  queryParams?: any;
};

function Empty({ queryParams }: Props) {
  const breadcrumb = [{ title: __("Inbox") }];
  const submenu = [{ title: __("Inbox"), link: "/inbox" }, { title: __("Insights"), link: "/insights" }];
  const content = (
    <EmptyState
      text="There is no message."
      size="full"
      image="/images/robots/robot-02.svg"
    />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header queryParams={queryParams} breadcrumb={breadcrumb} submenu={submenu} />
      }
      content={content}
      leftSidebar={<Sidebar queryParams={queryParams} />}
    />
  );
}

export default Empty;
