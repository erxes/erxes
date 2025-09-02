import React, { useState, useMemo, useRef, useEffect } from "react";
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const branches = useMemo(() => data?.branches || [], [data]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isMatchingBranch = (branch: IBranch): boolean => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      branch.title.toLowerCase().includes(searchLower) ||
      branch.code.toLowerCase().includes(searchLower)
    );
  };

  const hasMatchingChild = (branchId: string): boolean => {
    const children = branches.filter((b) => b.parentId === branchId);
    return children.some(
      (child) => isMatchingBranch(child) || hasMatchingChild(child._id)
    );
  };

  const hasMatchingParent = (branch: IBranch): boolean => {
    if (!branch.parentId) return false;
    const parent = branches.find((b) => b._id === branch.parentId);
    if (!parent) return false;
    return isMatchingBranch(parent) || hasMatchingParent(parent);
  };

  const topBranches = useMemo(() => {
    return branches.filter((b) => !b.parentId);
  }, [branches]);

  const autoExpandedIds = useMemo(() => {
    if (!searchTerm) return expandedIds;
    const newExpanded: Record<string, boolean> = { ...expandedIds };

    branches.forEach((branch) => {
      if (isMatchingBranch(branch) && branch.parentId) {
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
    const childrenIds = getAllChildrenIds(branchId);
    const isParent = childrenIds.length > 0;
    const alreadySelected = selectedIds.includes(branchId);

    let newSelection: string[] = [];

    if (!alreadySelected) {
      newSelection = [...selectedIds, branchId];
    } else if (isParent) {
      const hasChildrenSelected = childrenIds.some((id) =>
        selectedIds.includes(id)
      );

      if (!hasChildrenSelected) {
        newSelection = [
          ...selectedIds,
          ...childrenIds.filter((id) => !selectedIds.includes(id)),
        ];
      } else {
        newSelection = selectedIds.filter(
          (id) => id !== branchId && !childrenIds.includes(id)
        );
      }
    } else {
      newSelection = selectedIds.filter((id) => id !== branchId);
    }

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

  const highlightMatch = (text: string): JSX.Element => {
    if (!searchTerm) return <span>{text}</span>;

    const searchLower = searchTerm.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(searchLower);

    if (index === -1) return <span>{text}</span>;

    return (
      <span>
        {text.substring(0, index)}
        <mark style={{ backgroundColor: "#ffeb3b", padding: "0 2px" }}>
          {text.substring(index, index + searchTerm.length)}
        </mark>
        {text.substring(index + searchTerm.length)}
      </span>
    );
  };

  const renderBranch = (branch: IBranch, level = 0) => {
    const hasChildren = branches.some((b) => b.parentId === branch._id);
    const isExpanded = autoExpandedIds[branch._id] || expandedIds[branch._id];
    const isSelected = selectedIds.includes(branch._id);
    const isMatching = isMatchingBranch(branch);
    const hasMatchingChildren = hasMatchingChild(branch._id);

    if (
      searchTerm &&
      !isMatching &&
      !hasMatchingChildren &&
      !hasMatchingParent(branch)
    ) {
      return null;
    }

    return (
      <div
        key={branch._id}
        className="branch-item"
        style={{ marginLeft: `${level * 10}px` }}
      >
        <div
          className={`branch-row ${isSelected ? "selected" : ""} ${isMatching && searchTerm ? "highlighted" : ""}`}
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
          <span
            className="branch-label"
            title={`${branch.title} (${branch.code})`}
          >
            {highlightMatch(branch.title)}
            {branch.code && (
              <span className="branch-code">
                {" "}
                ({highlightMatch(branch.code)})
              </span>
            )}
          </span>
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

  // Clear all selections
  const clearSelections = () => {
    setSelectedIds([]);
    onSelect([], name);
  };

  // Get selected branches for display
  const getSelectedBranches = () => {
    return selectedIds
      .map((id) => branches.find((b) => b._id === id))
      .filter(Boolean);
  };

  if (loading) return <div className="loading">{__("Loading...")}</div>;
  if (error)
    return (
      <div className="error">
        {__("Error:")} {error.message}
      </div>
    );

  return (
    <div className="branch-selector-container" ref={dropdownRef}>
      <label>{label}</label>

      {/* Dropdown trigger */}
      <div
        className={`dropdown-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="trigger-content">
          {selectedIds.length === 0 ? (
            <span className="placeholder-text">{__("Choose branches")}</span>
          ) : selectedIds.length === 1 ? (
            <span className="display-text">
              {branches.find((b) => b._id === selectedIds[0])?.title}
            </span>
          ) : (
            <div className="multi-selection">
              <span className="count-text">
                {selectedIds.length} {__("branches selected")}
              </span>
              <div className="selected-tags">
                {getSelectedBranches()
                  .slice(0, 3)
                  ?.map((branch, index) => (
                    <span key={branch?._id} className="tag">
                      {branch?.title}
                      <span
                        className="tag-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(branch?._id || "");
                        }}
                      >
                        ×
                      </span>
                    </span>
                  ))}
                {selectedIds.length > 3 && (
                  <span className="more-count">
                    +{selectedIds.length - 3} {__("more")}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="trigger-actions">
          <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
          {selectedIds.length > 0 && (
            <span
              className="clear-button"
              onClick={(e) => {
                e.stopPropagation();
                clearSelections();
              }}
            >
              ✕
            </span>
          )}
        </div>
      </div>

      {/* Dropdown content */}
      {isOpen && (
        <div className="dropdown-content">
          <input
            type="text"
            placeholder={__("Search branches... (by name or code)")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="branch-list">
            {(() => {
              const renderedBranches = topBranches
                .map((branch) => renderBranch(branch))
                .filter(Boolean);
              return renderedBranches.length > 0 ? (
                renderedBranches
              ) : (
                <div className="no-results">
                  {searchTerm
                    ? __("No matching branches found")
                    : __("No branches found")}
                </div>
              );
            })()}
          </div>

          {selectedIds.length > 0 && (
            <div className="selection-summary">
              <div className="selected-count">
                {__("Selected:")} {selectedIds.length} {__("branch(es)")}
                <button className="clear-all-button" onClick={clearSelections}>
                  {__("Clear All")}
                </button>
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
        </div>
      )}

      <style>
        {`
    .branch-selector-container {
      font-family: Arial, sans-serif;
      width: 255px;
      position: relative;
    }

    label {
      font-weight: bold;
      margin-bottom: 8px;
      display: block;
      color: #333;
    }

    .dropdown-trigger {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 8px 12px;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      transition: border-color 0.2s;
      min-height: 20px;
    }

    .dropdown-trigger:hover {
      border-color: #007bff;
    }

    .dropdown-trigger.open {
      border-color: #007bff;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    .trigger-content {
      flex: 1;
      min-width: 0;
    }

    .trigger-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 8px;
      flex-shrink: 0;
    }

    .placeholder-text, .display-text {
      color: #333;
      font-size: 14px;
      display: block;
    }

    .placeholder-text {
      color: #999;
    }

    .multi-selection {
      width: 100%;
    }

    .count-text {
      color: #666;
      font-size: 12px;
      font-weight: 500;
      display: block;
      margin-bottom: 4px;
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      background: #e3f2fd;
      color: #1565c0;
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tag-remove {
      margin-left: 4px;
      color: #1976d2;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      padding: 0 2px;
      border-radius: 50%;
      transition: background 0.2s;
    }

    .tag-remove:hover {
      background: rgba(25, 118, 210, 0.1);
    }

    .more-count {
      color: #666;
      font-size: 11px;
      font-style: italic;
      padding: 2px 4px;
    }

    .dropdown-arrow {
      color: #666;
      font-size: 10px;
      margin-left: 8px;
    }

    .clear-button {
      color: #999;
      font-size: 16px;
      margin-left: 8px;
      padding: 0 4px;
      border-radius: 50%;
      transition: background 0.2s;
    }

    .clear-button:hover {
      background: #f0f0f0;
      color: #666;
    }

    .dropdown-content {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #007bff;
      border-top: none;
      border-radius: 0 0 4px 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1000;
      max-height: 400px;
      overflow: hidden;
    }

    .search-input {
      width: 100%;
      padding: 8px 12px;
      border: none;
      border-bottom: 1px solid #eee;
      font-size: 14px;
      box-sizing: border-box;
      outline: none;
    }

    .search-input:focus {
      border-bottom-color: #007bff;
    }

    .branch-list {
      max-height: 250px;
      overflow-y: auto;
      overflow-x: auto;
      white-space: nowrap;
      background: #f9f9f9;
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

    .branch-row.highlighted {
      background: #fff3cd;
      border: 1px dashed #ffc107;
    }

    .branch-row.selected.highlighted {
      background: #b2ebf2;
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
      max-width: 200px;
      display: inline-block;
      vertical-align: middle;
    }

    .branch-code {
      color: #666;
      font-size: 12px;
      font-style: italic;
    }

    .branch-children {
      padding-left: 20px;
      margin-left: 0;
      border-left: 1px dashed #ccc;
    }

    .selection-summary {
      padding: 8px;
      background: #f8f9fa;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #555;
      max-height: 150px;
      overflow-y: auto;
    }

    .selected-count {
      font-weight: 600;
      margin-bottom: 6px;
      color: #2c3e50;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .clear-all-button {
      background: #dc3545;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 11px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .clear-all-button:hover {
      background: #c82333;
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

    .no-results {
      padding: 20px;
      text-align: center;
      color: #666;
      font-style: italic;
      background: #f8f9fa;
      border-radius: 4px;
      margin: 10px 0;
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

    .selection-summary::-webkit-scrollbar {
      width: 6px;
    }

    .selection-summary::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .selection-summary::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    mark {
      background-color: #ffeb3b;
      padding: 0 2px;
      border-radius: 2px;
    }
  `}
      </style>
    </div>
  );
};

export default SelectNewBranches;
