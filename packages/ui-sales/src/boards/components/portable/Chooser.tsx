import {
  Button,
  CenterContent,
  EmptyState,
  Icon,
  ModalTrigger,
} from "@erxes/ui/src";
import FormControl from "@erxes/ui/src/components/form/Control";
import Popover from "@erxes/ui/src/components/Popover";
import {
  ActionTop,
  Column,
  Columns,
  Select,
} from "@erxes/ui/src/styles/chooser";
import { __ } from "@erxes/ui/src/utils";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import BoardSelect from "../../containers/BoardSelect";
import { PipelinePopoverContent } from "../../styles/item";
import { IItem } from "../../types";

const ColumnWrapper = styled(Column)`
  margin: 0px !important;
  padding: 0px !important;
  border: none !important;

  ${CenterContent} {
    padding-top: 10px;
    justify-content: center;
  }
`;

type Props = {
  mainType?: string;
  mainTypeId?: string;
  mainTypeName?: string;
  trigger?: React.ReactNode;
  relType?: string;
  variables: any;
  onChoose: (item: IItem) => void;
  onFilter: (variables: any) => void;
  onLoadMore?: () => void;
  options: any;
  items: IItem[];
  perPage?: number;
  loading?: boolean;
};

const Chooser = (props: Props) => {
  const timerRef = useRef<NodeJS.Timeout>();

  const {
    trigger,
    variables,
    loading,
    onFilter,
    onChoose,
    onLoadMore,
    options,
    items,
    perPage,
  } = props;

  const [loadMore, setLoadMore] = useState(false);

  useEffect(() => {
    setLoadMore(items.length === perPage && items.length > 0);
  }, [items.length]);

  const search = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const { value } = e.target;

    timerRef.current = setTimeout(() => {
      onFilter({ search: value });
    }, 500);
  };

  const handleLoadMore = () => {
    setLoadMore(false);

    onLoadMore && onLoadMore();
  };

  const clearFilter = (e) => {
    e.stopPropagation();
    onFilter({ stageId: "", pipelineId: "", boardId: "" });
  };

  const renderFilter = () => {
    const { stageId, pipelineId, boardId } = variables;

    const filtered = stageId || pipelineId || boardId;

    return (
      <Popover
        trigger={
          <Select>
            Filter
            <span>
              {filtered && <Icon icon="times" onClick={clearFilter} />}
              <Icon icon="angle-down" />
            </span>
          </Select>
        }
        placement="bottom-start"
      >
        <PipelinePopoverContent>
          <BoardSelect
            type={options.type}
            stageId={stageId}
            pipelineId={pipelineId}
            boardId={boardId}
            onChangeStage={(value) => onFilter({ stageId: value })}
            onChangePipeline={(value) => onFilter({ pipelineId: value })}
            onChangeBoard={(value) => onFilter({ boardId: value })}
          />
        </PipelinePopoverContent>
      </Popover>
    );
  };

  const renderItem = (item: IItem, props: any) => {
    const { closeModal } = props || {};

    return (
      <li
        key={item._id}
        onClick={() => {
          onChoose(item);
          closeModal();
        }}
      >
        {item.name || "Unknown"}
      </li>
    );
  };

  const renderItems = (props) => {
    if (items.length === 0) {
      return <EmptyState text="No matching items found" icon="list-ul" />;
    }

    return (
      <ul>
        {items.map((item) => renderItem(item, props))}
        {loadMore && (
          <CenterContent>
            <Button
              size="small"
              btnStyle="primary"
              onClick={handleLoadMore}
              icon="angle-double-down"
            >
              {loading ? "Loading" : "Load More"}
            </Button>
          </CenterContent>
        )}
      </ul>
    );
  };

  const renderContent = (props) => {
    return (
      <Columns>
        <ColumnWrapper>
          <ActionTop>
            <FormControl placeholder={__("Type to search")} onChange={search} />
            {renderFilter()}
          </ActionTop>
          {renderItems(props)}
        </ColumnWrapper>
      </Columns>
    );
  };

  return (
    <ModalTrigger
      title={`Choose ${options.type}`}
      trigger={trigger}
      content={(props) => renderContent(props)}
    />
  );
};

export default Chooser;
