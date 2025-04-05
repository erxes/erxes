import React, { useEffect, useState } from 'react';
import Button from '@erxes/ui/src/components/Button';
import FilterableList from '@erxes/ui/src/components/filterableList/FilterableList';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __ } from '@erxes/ui/src/utils';
import { IBundleRule } from '@erxes/ui-products/src/types';

type TaggerProps = {
  // targets can be conversation, customer, company etc ...
  targets?: any[];
  event?: 'onClick' | 'onExit';
  className?: string;
  disableTreeView?: boolean;
  loading: boolean;
  bundleRules: IBundleRule[];
  setBundle: (bundleIds: string) => void;
  totalCount: number;
  singleSelect?: boolean;
  onLoadMore?: (page: number) => void;
};

type TaggerState = {
  tagsForList: any[];
  cursor: number;
  page: number;
};

const Tagger: React.FC<TaggerProps> = props => {
  const {
    targets,
    event,
    className,
    disableTreeView,
    loading,
    bundleRules,
    setBundle,
    totalCount,
    singleSelect,
    onLoadMore
  } = props;

  const [state, setState] = useState<TaggerState>({
    tagsForList: [],
    cursor: 0,
    page: 1
  });

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      tagsForList: generateTagsParams(bundleRules, targets)
    }));
  }, [bundleRules, targets]);

  // useEffect(() => {
  //   const handleArrowSelection = (event: any) => {
  //     const { cursor, tagsForList } = state;
  //     const maxCursor: number = tagsForList.length;

  //     switch (event.keyCode) {
  //       case 13:
  //         const element = document.getElementsByClassName(
  //           'tag-' + cursor
  //         )[0] as HTMLElement;
  //         const showTags = document.getElementById('conversationTags');

  //         if (element && showTags) {
  //           element.click();
  //           setter(state.tagsForList);
  //           showTags.click();
  //         }
  //         break;
  //       case 38:
  //         // Arrow move up
  //         if (cursor > 0) {
  //           setState(prevState => ({ ...prevState, cursor: cursor - 1 }));
  //         }
  //         if (cursor === 0) {
  //           setState(prevState => ({ ...prevState, cursor: maxCursor - 1 }));
  //         }
  //         break;
  //       case 40:
  //         // Arrow move down
  //         if (cursor < maxCursor - 1) {
  //           setState(prevState => ({ ...prevState, cursor: cursor + 1 }));
  //         } else {
  //           setState(prevState => ({ ...prevState, cursor: 0 }));
  //         }
  //         break;
  //       default:
  //         break;
  //     }
  //   };
  // }, [state.cursor, state.tagsForList]);

  const generateTagsParams = (
    tags: IBundleRule[] = [],
    targets: any[] = []
  ) => {
    return tags.map(({ _id, name }, i) => {
      const count = targets.reduce(
        (memo, target) => memo + ((target.tagIds || []).includes(_id) ? 1 : 0),
        0
      );

      let tagState = 'none';

      if (count > 0) {
        if (count === targets.length) {
          tagState = 'all';
        } else if (count < targets.length) {
          tagState = 'some';
        }
      }

      return {
        _id,
        title: name,
        iconClass: 'icon-box',
        selectedBy: tagState,
        itemActiveClass: state && state.cursor === i && 'active'
      };
    });
  };

  const onLoad = () => {
    setState(prevState => ({
      ...prevState,
      page: prevState.page + 1
    }));

    onLoadMore && onLoadMore(state.page + 1);
  };

  const setter = (items: IBundleRule[]) => {
    const { tagsForList } = state;
    const unchanged = tagsForList.reduce(
      (prev, current, index) =>
        prev && current.selectedBy === items[index]?.selectedBy,
      true
    );

    if (!unchanged) {
      const selected = items
        .filter(t => t.selectedBy === 'all')
        .map(t => t._id);
      if (selected.length > 0) setBundle(selected[0]);
    }
  };

  const renderLoadMore = () => {
    if (bundleRules.length >= totalCount) {
      return null;
    }

    return (
      <Button
        block={true}
        btnStyle='link'
        onClick={() => onLoad()}
        icon='redo'
        uppercase={false}
      >
        {loading ? 'Loading...' : 'Load more'}
      </Button>
    );
  };

  const links = [
    {
      title: __('Manage Bundle'),
      href: `/settings/bundle-rule`
    }
  ];

  const listProps = {
    className,
    links,
    selectable: true,
    treeView: disableTreeView ? false : true,
    items: JSON.parse(JSON.stringify(state.tagsForList)),
    isIndented: false,
    singleSelect,
    renderLoadMore
  };

  if (loading) {
    return <Spinner objective={true} />;
  }

  if (event) {
    listProps[event] = setter;
  }

  return <FilterableList {...listProps} />;
};

export default Tagger;
