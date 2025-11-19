/**
 * 面包屑导航组件
 * 
 * 放置位置: frontend/src/components/Breadcrumb.tsx
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * 面包屑导航组件
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {/* 分隔符 */}
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}

            {/* 面包屑项 */}
            {isLast ? (
              <span className="flex items-center gap-1 font-medium text-gray-900">
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </span>
            ) : item.path ? (
              <Link
                to={item.path}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1">
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

/**
 * 从组织祖先列表生成面包屑
 */
export const generateOrgBreadcrumbs = (
  ancestors: Array<{ id: string; name: string }>,
  currentOrg?: { id: string; name: string }
): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [
    {
      label: 'Organization management',
      path: '/admin/organizations',
      icon: '🏢',
    },
  ];

  // 添加祖先组织
  ancestors.forEach((ancestor) => {
    items.push({
      label: ancestor.name,
      path: `/admin/organization/${ancestor.id}`,
    });
  });

  // 添加当前组织
  if (currentOrg) {
    items.push({
      label: currentOrg.name,
    });
  }

  return items;
};

export default Breadcrumb;






