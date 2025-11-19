/**
 * 组织树形列表组件
 * 
 * 放置位置: frontend/src/components/OrganizationTree.tsx
 */

import React, { useState } from 'react';
import { Organization } from '../types/organization';

interface OrganizationTreeProps {
  organizations: Organization[];
  onSelect?: (org: Organization) => void;
  onEdit?: (org: Organization) => void;
  onDelete?: (org: Organization) => void;
  onAddChild?: (parentOrg: Organization) => void;
  selectedId?: string;
}

interface TreeNodeProps {
  node: Organization;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect?: (org: Organization) => void;
  onEdit?: (org: Organization) => void;
  onDelete?: (org: Organization) => void;
  onAddChild?: (org: Organization) => void;
  isSelected: boolean;
}

/**
 * 树形节点组件
 */
const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  isExpanded,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  isSelected,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const paddingLeft = level * 24;

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      {/* 节点内容 */}
      <div
        className={`flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-blue-50' : ''
        }`}
        style={{ paddingLeft: `${paddingLeft + 16}px` }}
      >
        {/* 左侧：展开图标 + 组织信息 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* 展开/折叠图标 */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ) : (
            <div className="w-5 h-5 flex-shrink-0" />
          )}

          {/* 组织图标 */}
          <div className="flex-shrink-0 text-2xl">
            {hasChildren ? '📁' : '📄'}
          </div>

          {/* 组织信息 */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onSelect?.(node)}
          >
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 truncate">
                {node.name}
              </h4>
              {!node.isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Disabled
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>Manager: {node.leaderName}</span>
              {node.assessmentCount !== undefined && (
                <span>
                  Assessment: {node.completedAssessmentCount || 0}/{node.assessmentCount || 0}
                </span>
              )}
              {hasChildren && (
                <span>Sub-organization: {node.children!.length}</span>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2 ml-4">
          {onAddChild && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node);
              }}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="Create sub-organization"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node);
              }}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node);
              }}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 子节点 */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeWrapper
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              selectedId={isSelected ? node.id : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 树形节点包装器（处理展开/折叠状态）
const TreeNodeWrapper: React.FC<Omit<TreeNodeProps, 'isExpanded' | 'onToggle' | 'isSelected'> & { selectedId?: string }> = ({
  node,
  level,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  selectedId,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <TreeNode
      node={node}
      level={level}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      onSelect={onSelect}
      onEdit={onEdit}
      onDelete={onDelete}
      onAddChild={onAddChild}
      isSelected={node.id === selectedId}
    />
  );
};

/**
 * 组织树形列表
 */
export const OrganizationTree: React.FC<OrganizationTreeProps> = ({
  organizations,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  selectedId,
}) => {
  if (organizations.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-400 text-5xl mb-4">📁</div>
        <p className="text-gray-500 mb-2">No organization yet</p>
        <p className="text-sm text-gray-400">Click the "Create" button above to create your first organization.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {organizations.map((org) => (
        <TreeNodeWrapper
          key={org.id}
          node={org}
          level={0}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
};

export default OrganizationTree;
