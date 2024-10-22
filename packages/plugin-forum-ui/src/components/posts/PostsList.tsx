import { Alert, confirm } from "@erxes/ui/src/utils";
import { __, router as routerUtils } from "@erxes/ui/src/utils";

import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import { EMPTY_CONTENT_FORUMS } from "@erxes/ui-settings/src/constants";
import EmptyContent from "@erxes/ui/src/components/empty/EmptyContent";
import { Flex } from "@erxes/ui/src/styles/main";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IPost } from "../../types";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import PostForm from "../../containers/posts/PostForm";
import React from "react";
import Row from "./Row";
import Sidebar from "./Sidebar";
import SortHandler from "@erxes/ui/src/components/SortHandler";
import Table from "@erxes/ui/src/components/table";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { useNavigate, useLocation } from "react-router-dom";

type Props = {
  posts: IPost[];
  queryParams?: any;
  loading: boolean;
  remove: (postId: string, emptyBulk?: () => void) => void;
  bulk: any[];
  emptyBulk: () => void;
  isAllSelected: boolean;
  totalCount: number;
  toggleBulk: (target: IPost, toAdd: boolean) => void;
  toggleAll: (targets: IPost[], containerId: string) => void;
};

const List = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const renderRow = () => {
    const { posts, remove, bulk, toggleBulk } = props;

    return posts.map((post) => (
      <Row
        key={post._id}
        post={post}
        isChecked={bulk.includes(post)}
        toggleBulk={toggleBulk}
        remove={remove}
      />
    ));
  };

  const searchHandler = (event) => {
    routerUtils.setParams(navigate, location, { search: event.target.value });
  };

  const {
    queryParams,
    loading,
    posts,
    isAllSelected,
    bulk,
    toggleAll,
    remove,
    emptyBulk,
    totalCount,
  } = props;

  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const onClick = () => {
      confirm("Are you sure? This cannot be undone.")
        .then(() => {
          bulk.map((item) => remove(item._id, emptyBulk));
          Alert.success("You successfully deleted a post");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    actionBarLeft = (
      <Button
        btnStyle="danger"
        size="small"
        icon="times-circle"
        onClick={onClick}
      >
        Delete
      </Button>
    );
  }

  const actionBarRight = (
    <Flex>
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={searchHandler}
        value={routerUtils.getParam(location, "search")}
      />
      &nbsp;&nbsp;
      <ModalTrigger
        title={__("Create New Post")}
        size="lg"
        trigger={
          <Button btnStyle="success" size="small" icon="plus-circle">
            Create New Post
          </Button>
        }
        content={(props) => <PostForm {...props} />}
        enforceFocus={false}
      />
    </Flex>
  );

  const onChange = () => {
    toggleAll(posts, "posts");
  };

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
  );

  const content = (
    <Table $whiteSpace="nowrap" $hover={true}>
      <thead>
        <tr>
          <th>
            <FormControl
              checked={isAllSelected}
              componentclass="checkbox"
              onChange={onChange}
            />
          </th>
          <th>
            <SortHandler sortField={"title"} label={__("Title")} />
          </th>
          <th>{__("State")}</th>
          <th>
            <SortHandler
              sortField={"lastPublishedAt"}
              label={__("Last Published at")}
            />
          </th>
          <th>
            <SortHandler sortField={"createdAt"} label={__("Created At")} />
          </th>
          <th>{__("Created by")}</th>
          <th>
            <SortHandler sortField={"updatedAt"} label={__("Updated At")} />
          </th>
          <th>{__("Updated By")}</th>
          <th>
            <SortHandler
              sortField={"commentCount"}
              label={__("Comment(s) count")}
            />
          </th>
          <th>
            <SortHandler
              sortField={"upVoteCount"}
              label={__("Up vote count")}
            />
          </th>
          <th>
            <SortHandler
              sortField={"downVoteCount"}
              label={__("Down vote count")}
            />
          </th>
          <th>
            <SortHandler sortField={"viewCount"} label={__("View count")} />
          </th>
          <th>{__("Actions")}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  const submenu = [
    { title: "Posts", link: "/forums/posts" },
    { title: "Pages", link: "/forums/pages" },
    { title: "Quiz", link: "/forums/quizzes" },
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Posts")}
          queryParams={queryParams}
          submenu={submenu}
        />
      }
      leftSidebar={<Sidebar />}
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={posts.length}
          emptyContent={
            <EmptyContent content={EMPTY_CONTENT_FORUMS} maxItemWidth="360px" />
          }
        />
      }
      hasBorder={true}
    />
  );
};

export default List;
