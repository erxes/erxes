import React, { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  commonStructureParamsDef,
  commonStructureParamsValue,
} from "../graphql/queries";
import { __ } from "@erxes/ui/src/utils/core";

interface IBranch {
  _id: string;
  code: string;
  title: string;
  parentId: string | null;
}

interface SelectNewBranchesProps {
  name: string;
  label: string;
  initialValue?: string | string[];
  onSelect: (value: string[] | string, name: string) => void;
  filterParams?: {
    withoutUserFilter?: boolean;
    searchValue?: string;
    ids?: string[];
  };
}

const BRANCHES_QUERY = gql`
  query branches(${commonStructureParamsDef}, $withoutUserFilter: Boolean) {
    branches(${commonStructureParamsValue}, withoutUserFilter: $withoutUserFilter) {
      _id
      code
      title
      parentId
    }
  }
`;

const SelectNewBranches: React.FC<SelectNewBranchesProps> = ({
  name,
  label,
  initialValue,
  onSelect,
  filterParams = {},
}) => {
  const { loading, error, data } = useQuery<{ branches: IBranch[] }>(
    BRANCHES_QUERY,
    {
      variables: filterParams,
      fetchPolicy: "cache-and-network",
    }
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialValue
      ? Array.isArray(initialValue)
        ? initialValue
        : [initialValue]
      : []
  );
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState<string>("");

  const branches = useMemo(() => data?.branches || [], [data]);

  // Check if a branch or its descendants match the search term
  const hasMatchingDescendant = (branchId: string): boolean => {
    const branch = branches.find((b) => b._id === branchId);
    if (!branch) return false;
    if (branch.title.toLowerCase().includes(searchTerm.toLowerCase()))
      return true;
    return branches.some(
      (b) => b.parentId === branchId && hasMatchingDescendant(b._id)
    );
  };

  // Filter top-level branches based on search term
  const filteredTopBranches = useMemo(() => {
    if (!searchTerm) return branches.filter((b) => !b.parentId);
    return branches.filter(
      (branch) =>
        !branch.parentId &&
        (branch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hasMatchingDescendant(branch._id))
    );
  }, [branches, searchTerm]);

  // Auto-expand parents of matching children
  const autoExpandedIds = useMemo(() => {
    if (!searchTerm) return expandedIds;
    const newExpanded: Record<string, boolean> = { ...expandedIds };
    branches.forEach((branch) => {
      if (
        branch.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        branch.parentId
      ) {
        let currentId = branch.parentId;
        while (currentId) {
          newExpanded[currentId] = true;
          const parent = branches.find((b) => b._id === currentId);
          currentId = parent?.parentId || "";
        }
      }
    });
    return newExpanded;
  }, [branches, searchTerm, expandedIds]);

  // Function to get full path for a branch
  const getBranchPath = (branchId: string): string => {
    const path: string[] = [];
    let currentId = branchId;

    while (currentId) {
      const branch = branches.find((b) => b._id === currentId);
      if (!branch) break;
      path.unshift(branch.title);
      currentId = branch.parentId || "";
    }

    return path.join(" > ");
  };

  // Function to get all child branch IDs recursively
  const getAllChildrenIds = (branchId: string): string[] => {
    const children = branches
      .filter((b) => b.parentId === branchId)
      .map((b) => b._id);
    let allChildren = [...children];
    children.forEach((childId) => {
      allChildren = allChildren.concat(getAllChildrenIds(childId));
    });
    return allChildren;
  };

  const toggleSelection = (branchId: string) => {
    const newSelection = selectedIds.includes(branchId)
      ? selectedIds.filter(
          (id) => id !== branchId && !getAllChildrenIds(branchId).includes(id)
        )
      : Array.from(
          new Set([...selectedIds, branchId, ...getAllChildrenIds(branchId)])
        );

    setSelectedIds(newSelection);
    onSelect(newSelection, name);
  };

  const toggleExpand = (branchId: string) => {
    setExpandedIds((prev) => ({ ...prev, [branchId]: !prev[branchId] }));
  };

  // Function to get only the most specific paths (excluding parent paths when children are selected)
  const getMostSpecificPaths = (): string[] => {
    const allPaths = selectedIds.map((branchId) => getBranchPath(branchId));
    const mostSpecificPaths: string[] = [];

    allPaths.forEach((path) => {
      const isAncestor = allPaths.some(
        (otherPath) => otherPath !== path && otherPath.startsWith(path + " > ")
      );
      if (!isAncestor) {
        mostSpecificPaths.push(path);
      }
    });

    return mostSpecificPaths;
  };

  const renderBranch = (branch: IBranch, level = 0) => {
    const hasChildren = branches.some((b) => b.parentId === branch._id);
    const isExpanded = autoExpandedIds[branch._id] || expandedIds[branch._id];
    const isSelected = selectedIds.includes(branch._id);

    return (
      <div
        key={branch._id}
        className="branch-item"
        style={{ marginLeft: `${level * 10}px` }}
      >
        <div
          className={`branch-row ${isSelected ? "selected" : ""}`}
          onClick={() => toggleSelection(branch._id)}
        >
          <input
            className="checkboxInput"
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelection(branch._id)}
            style={{ marginRight: "10px" }}
          />
          {hasChildren && (
            <span
              className="expand-icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(branch._id);
              }}
            >
              {isExpanded ? "▼" : "▶"}
            </span>
          )}
          {!hasChildren && <span className="empty-icon"></span>}
          <span className="branch-label">{branch.title}</span>
        </div>

        {isExpanded && hasChildren && (
          <div className="branch-children">
            {branches
              .filter((b) => b.parentId === branch._id)
              .map((child) => renderBranch(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="loading">{__("Loading...")}</div>;
  if (error)
    return (
      <div className="error">
        {__("Error:")} {error.message}
      </div>
    );

  return (
    <div className="branch-selector-container">
      <label>{label}</label>
      <input
        type="text"
        placeholder={__("Search branches...")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="branch-list">
        {filteredTopBranches.length > 0 ? (
          filteredTopBranches.map((branch) => renderBranch(branch))
        ) : (
          <div>{__("No branches found")}</div>
        )}
      </div>
      {selectedIds.length > 0 && (
        <div className="selection-summary">
          <div className="selected-count">
            {__("Selected:")} {selectedIds.length} {__("branch(es)")}
          </div>
          <div className="selected-paths">
            {getMostSpecificPaths().map((path, index) => {
              const branchId = selectedIds.find(
                (id) => getBranchPath(id) === path
              )!;
              return (
                <div key={index} className="path-item">
                  <input
                    type="checkbox"
                    checked
                    onChange={() => toggleSelection(branchId)}
                    style={{ marginRight: "8px" }}
                  />
                  {path}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <style>
        {`
    .branch-selector-container {
      font-family: Arial, sans-serif;
      width: 255px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    label {
      font-weight: bold;
      margin-bottom: 8px;
      display: block;
      color: #333;
    }

    .search-input {
      width: 100%;
      padding: 6px 8px;
      margin-bottom: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .branch-list {
      max-height: 300px;
      overflow-y: auto;
      overflow-x: auto;
      white-space: nowrap;
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 8px;
      scrollbar-width: thin;
    }

    .branch-item {
      margin: 4px 0;
      min-width: fit-content;
    }

    .branch-row {
      display: flex;
      align-items: center;
      padding: 6px 10px;
      cursor: pointer;
      border-radius: 3px;
      transition: background 0.2s;
      min-width: max-content;
    }

    .branch-row:hover {
      background: #f0f0f0;
    }

    .branch-row.selected {
      background: #e0f7fa;
      font-weight: 500;
    }

    .expand-icon, .empty-icon {
      min-width: 16px;
      margin-right: 8px;
      text-align: center;
      color: #666;
      font-size: 10px;
    }

    .empty-icon {
      visibility: hidden;
    }

    .branch-label {
      font-size: 14px;
      color: #444;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 250px;
      display: inline-block;
      vertical-align: middle;
    }

    .branch-children {
      padding-left: 20px;
      margin-left: 0;
      border-left: 1px dashed #ccc;
    }

    .selection-summary {
      margin-top: 10px;
      padding: 8px;
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 12px;
      color: #555;
    }

    .selected-count {
      font-weight: 600;
      margin-bottom: 6px;
      color: #2c3e50;
    }

    .selected-paths {
      margin-top: 4px;
    }

    .path-item {
      padding: 4px 0;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
      font-size: 13px;
    }

    .path-item:last-child {
      border-bottom: none;
    }

    .loading, .error {
      padding: 12px;
      border-radius: 4px;
    }

    .error {
      color: #d32f2f;
      background: #ffebee;
    }

    input[type="checkbox"] {
      margin: 0;
      vertical-align: middle;
      border: 1px solid #ccc;
      background: #e9ecef;
      border-radius: 3px;
      cursor: pointer;
    }

    input[type="checkbox"]:checked {
      accent-color: #007bff;
      background: #cce5ff;
    }

    .branch-list::-webkit-scrollbar {
      height: 8px;
      width: 8px;
    }

    .branch-list::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .branch-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    .branch-list::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `}
      </style>
    </div>
  );
};

export default SelectNewBranches;
