import Button from "@erxes/ui/src/components/Button";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";
import Table from "@erxes/ui/src/components/table";
import { Title } from "@erxes/ui/src/styles/main";
import { __ } from "@erxes/ui/src/utils/core";
import { router as routerUtils } from "@erxes/ui/src/utils";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ICalendar, IPage } from "../../types";
import PageRow from "./PageRow";
import Sidebar from "./Sidebar";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  pages: IPage[];
  calendars: ICalendar[];
  queryParams: { accountId?: string };
  remove: (pageId: string) => void;
};

const Base = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (props.calendars.length > 0 && !props.queryParams.accountId) {
      routerUtils.setParams(navigate, location, {
        accountId: props.calendars[0].accountId,
      });
    }
  }, []);

  const renderButtons = () => {
    if (props.calendars.length === 0) {
      return;
    }

    return (
      <Button btnStyle="success" icon="plus-circle">
        <Link to={`/settings/schedule/create/${props.queryParams.accountId}`}>
          Add New Page
        </Link>
      </Button>
    );
  };

  const { pages, calendars, queryParams, remove } = props;
  const { accountId } = queryParams;

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Calendar"), link: `/settings/calendars` },
    { title: __("Schedule"), link: "" },
  ];

  let calendarName = "";

  if (accountId) {
    calendarName = (
      calendars.find((c) => c.accountId === accountId) || ({} as ICalendar)
    ).name;
  }

  const content =
    accountId && calendars.length > 0 ? (
      <div>
        <Wrapper.ActionBar
          left={<Title>{calendarName}</Title>}
          right={renderButtons()}
        />

        <Table>
          <thead>
            <tr>
              <th>{__("Your Scheduling Pages")}</th>
              <th> {__("Action")}</th>
            </tr>
          </thead>

          <tbody>
            {pages.map((page) => (
              <PageRow
                key={page._id}
                page={page}
                accountId={accountId}
                remove={remove}
              />
            ))}
          </tbody>
        </Table>
      </div>
    ) : (
      <EmptyState
        text={`Get started on your board`}
        image="/images/actions/16.svg"
      />
    );

  return (
    <Wrapper
      header={<Wrapper.Header title={__("Schedule")} breadcrumb={breadcrumb} />}
      leftSidebar={
        calendars.length > 1 && (
          <Sidebar accountId={accountId} calendars={calendars} />
        )
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/34.svg"
          title={`Calendar & Schedule`}
          description={`${__(
            "Manage your boards and calendars so that its easy to manage incoming pop ups or requests that is adaptable to your team's needs"
          )}.${__(
            `Add in or delete boards and calendars to keep business development on track and in check`
          )}`}
        />
      }
      content={content}
    />
  );
};

export default Base;
