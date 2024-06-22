import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import FolderForm from "../../containers/folder/FolderForm";
import FolderRow from "./FolderRow";
import { Header } from "@erxes/ui-settings/src/styles";
import { IFolder } from "../../types";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";

type Props = {
  folders: IFolder[];
  remove: (folderId: string) => void;
  loading: boolean;
  queryParams: any;
};

const FolderList: React.FC<Props> = ({
  folders,
  remove,
  loading,
  queryParams,
}) => {
  const [openFolderIds, setOpenFolderIds] = useState<string[]>([]);

  const toggleFolder = (folderId: string) => {
    const folder = folders.find((f) => f._id === folderId);

    if (!folder) {
      return;
    }

    if (openFolderIds.includes(folderId)) {
      const idsToRemove: string[] = [];

      for (const f of folders) {
        if (f.order.startsWith(folder.order)) {
          idsToRemove.push(f._id);
        }
      }

      setOpenFolderIds(openFolderIds.filter((id) => !idsToRemove.includes(id)));
    } else {
      const newOpenFolderIds: string[] = [];

      for (const f of folders) {
        if (f.order.startsWith(folder.order)) {
          const [firstPart, lastPart] = f.order.split(folder.order);

          if (!lastPart.includes("/")) {
            newOpenFolderIds.push(f._id);
          }
        }
      }

      setOpenFolderIds([...openFolderIds, ...newOpenFolderIds]);
    }
  };

  const renderRow = (folder: IFolder) => {
    if (folder.parentId && !openFolderIds.includes(folder.parentId)) {
      return null;
    }

    const modifiedFolder = {
      ...folder,
      isOpen: openFolderIds.includes(folder._id) || false,
      isParent:
        folders.filter(
          (f) => f._id !== folder._id && f.order.startsWith(folder.order)
        ).length > 0 || false,
    };

    return (
      <FolderRow
        key={folder._id}
        isActive={queryParams ? queryParams._id === folder._id : false}
        folder={modifiedFolder}
        toggleFolder={toggleFolder}
        remove={remove}
        queryParams={queryParams}
      />
    );
  };

  const renderItems = () => {
    return folders.map((folder: IFolder) => (
      <React.Fragment key={folder._id}>{renderRow(folder)}</React.Fragment>
    ));
  };

  const renderSidebarHeader = () => {
    const addFolder = (
      <Button btnStyle="success" block={true} icon="plus-circle">
        Add Root Folder
      </Button>
    );

    const content = (props) => (
      <FolderForm {...props} queryParams={queryParams} root={true} />
    );

    return (
      <Header>
        <ModalTrigger
          title="New Folder"
          autoOpenKey="showFolderAddModal"
          trigger={addFolder}
          content={content}
          enforceFocus={false}
        />
      </Header>
    );
  };

  return (
    <Sidebar wide={true} hasBorder={true} header={renderSidebarHeader()}>
      <DataWithLoader
        data={renderItems()}
        loading={loading}
        count={folders.length}
        emptyText="There is no folder"
        emptyImage="/images/actions/5.svg"
      />
    </Sidebar>
  );
};

export default FolderList;
