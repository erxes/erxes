import { ITag, ITagTypes } from "../types";
import React, { useEffect, useState } from "react";
import Button from "@erxes/ui/src/components/Button";
import FilterableList from "@erxes/ui/src/components/filterableList/FilterableList";
import Spinner from "@erxes/ui/src/components/Spinner";
import { __ } from "@erxes/ui/src/utils";

type TaggerProps = {
  type: ITagTypes | string;
  targets?: any[];
  event?: "onClick" | "onExit";
  className?: string;
  disableTreeView?: boolean;
  loading: boolean;
  tags: ITag[];
  tag: (tags: string[]) => void;
  totalCount: number;
  singleSelect?: boolean;
  onLoadMore?: (page: number) => void;
};

type TaggerState = {
  tagsForList: any[];
  cursor: number;
  page: number;
  isExpanded: boolean;
};

const MAX_VISIBLE_TAGS = 3;

const Tagger: React.FC<TaggerProps> = (props) => {
  const {
    type,
    targets = [],
    event,
    className,
    disableTreeView,
    loading,
    tags,
    tag,
    totalCount,
    singleSelect,
    onLoadMore,
  } = props;

  const [state, setState] = useState<TaggerState>({
    tagsForList: [],
    cursor: 0,
    page: 1,
    isExpanded: false,
  });

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      tagsForList: generateTagsParams(tags, targets),
    }));
  }, [tags, targets]);

  useEffect(() => {
    const handleArrowSelection = (event: any) => {
      const { cursor, tagsForList } = state;
      const maxCursor = tagsForList.length;

      switch (event.keyCode) {
        case 13: {
          const element = document.getElementsByClassName(
            `tag-${cursor}`
          )[0] as HTMLElement;
          const showTags = document.getElementById("conversationTags");

          if (element && showTags) {
            element.click();
            tagger(state.tagsForList);
            showTags.click();
          }
          break;
        }
        case 38:
          setState((s) => ({
            ...s,
            cursor: cursor > 0 ? cursor - 1 : maxCursor - 1,
          }));
          break;
        case 40:
          setState((s) => ({
            ...s,
            cursor: cursor < maxCursor - 1 ? cursor + 1 : 0,
          }));
          break;
      }
    };

    if (type === "inbox:conversation") {
      document.addEventListener("keydown", handleArrowSelection);
      return () =>
        document.removeEventListener("keydown", handleArrowSelection);
    }
  }, [state.cursor, state.tagsForList, type]);

  const generateTagsParams = (tags: ITag[] = [], targets: any[] = []) => {
    return tags.map(({ _id, name, colorCode, parentId }, i) => {
      const count = targets.reduce(
        (memo, target) => memo + ((target.tagIds || []).includes(_id) ? 1 : 0),
        0
      );

      let tagState = "none";
      if (count > 0) {
        tagState = count === targets.length ? "all" : "some";
      }

      return {
        _id,
        title: name,
        iconClass: "icon-tag-alt",
        iconColor: colorCode,
        parentId,
        selectedBy: tagState,
        itemClassName: type === "inbox:conversation" ? `tag-${i}` : "",
        itemActiveClass:
          type === "inbox:conversation" && state.cursor === i ? "active" : "",
      };
    });
  };

  const onLoad = () => {
    setState((s) => ({
      ...s,
      page: s.page + 1,
    }));
    onLoadMore?.(state.page + 1);
  };

  const tagger = (tags: ITag[]) => {
    const { tagsForList } = state;

    const unchanged = tagsForList.reduce(
      (prev, current, index) =>
        prev && current.selectedBy === tags[index].selectedBy,
      true
    );

    if (!unchanged) {
      tag(tags.filter((t) => t.selectedBy === "all").map((t) => t._id));
    }
  };

  const renderLoadMore = () => {
    if (tags.length >= totalCount) return null;

    return (
      <Button
        block
        btnStyle="link"
        onClick={onLoad}
        icon="redo"
        uppercase={false}
      >
        {loading ? "Loading..." : state.isExpanded ? "Collapse" : "Load more"}
      </Button>
    );
  };

  const links = [
    {
      title: __("Manage tags"),
      href: `/settings/tags?tagType=${type}`,
    },
  ];

  const listProps = {
    className,
    links,
    selectable: true,
    treeView: !disableTreeView,
    items: JSON.parse(JSON.stringify(state.tagsForList)),
    isIndented: false,
    singleSelect,
    renderLoadMore,
  };

  const selectedTags = tags.filter((tag) =>
    targets.every((t) => t.tagIds?.includes(tag._id))
  );

  const visibleTags = state.isExpanded
    ? selectedTags
    : selectedTags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = selectedTags.length - MAX_VISIBLE_TAGS;

  const renderSelectedTags = () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "4px",
        marginBottom: "12px",
        maxWidth: "100%",
        overflow: "visible",
        transition: "all 0.3s ease",
      }}
    >
      {visibleTags.map((tag) => (
        <span
          key={tag._id}
          style={{
            backgroundColor: tag.colorCode || "#e0e0e0",
            color: "#333",
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            transition: "background-color 0.3s",
            cursor: "pointer",
            whiteSpace: "normal",
            maxWidth: "none",
            margin: "5px",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = "#d0d0d0";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = tag.colorCode || "#e0e0e0";
          }}
        >
          {tag.name}
        </span>
      ))}
      {hiddenCount > 0 && !state.isExpanded && (
        <span
          onClick={() => setState((s) => ({ ...s, isExpanded: true }))}
          style={{
            backgroundColor: "#ccc",
            color: "#333",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            cursor: "pointer",
            transition: "background-color 0.3s",
            margin: "5px",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = "#bbb";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = "#ccc";
          }}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );

  if (loading) return <Spinner objective />;

  if (event) {
    listProps[event] = tagger;
  }

  return (
    <div>
      {renderSelectedTags()}
      <FilterableList {...listProps} />
    </div>
  );
};

export default Tagger;
