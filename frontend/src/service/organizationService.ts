/**
 * 组织管理 API 服务
 * 
 * 放置位置: frontend/src/services/organizationService.ts
 */

import {
  Organization,
  OrganizationFormData,
  OrganizationsResponse,
  OrganizationDetailResponse,
  ApiResponse,
} from '../types/organization';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============================================
// 辅助函数
// ============================================

/**
 * 处理 API 响应错误
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.error || error.message || 'API 请求失败');
  }
  return response.json();
}

// ============================================
// 组织管理 API
// ============================================

/**
 * 获取所有组织
 * @param format - 'tree' 或 'flat'
 * @param includeInactive - 是否包含已禁用的组织
 */
export async function getOrganizations(
  format: 'tree' | 'flat' = 'tree',
  includeInactive: boolean = false
): Promise<Organization[]> {
  const params = new URLSearchParams({
    format,
    includeInactive: includeInactive.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/admin/organizations?${params}`);
  const data = await handleResponse<OrganizationsResponse>(response);
  return data.data;
}

/**
 * 获取单个组织详情
 * @param id - 组织 ID
 * @param includeChildren - 是否包含子组织
 * @param includeAssessments - 是否包含评估
 */
export async function getOrganizationById(
  id: string,
  includeChildren: boolean = true,
  includeAssessments: boolean = true
): Promise<Organization & { stats: any }> {
  const params = new URLSearchParams({
    includeChildren: includeChildren.toString(),
    includeAssessments: includeAssessments.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/admin/organizations/${id}?${params}`);
  const data = await handleResponse<OrganizationDetailResponse>(response);
  return data.data;
}

/**
 * 创建新组织
 * @param formData - 组织表单数据
 */
export async function createOrganization(
  formData: OrganizationFormData
): Promise<Organization> {
  const response = await fetch(`${API_BASE_URL}/admin/organizations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const data = await handleResponse<ApiResponse<Organization>>(response);
  if (!data.data) {
    throw new Error('创建组织失败：未返回数据');
  }
  return data.data;
}

/**
 * 更新组织信息
 * @param id - 组织 ID
 * @param formData - 更新的数据
 */
export async function updateOrganization(
  id: string,
  formData: Partial<OrganizationFormData>
): Promise<Organization> {
  const response = await fetch(`${API_BASE_URL}/admin/organizations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const data = await handleResponse<ApiResponse<Organization>>(response);
  if (!data.data) {
    throw new Error('更新组织失败：未返回数据');
  }
  return data.data;
}

/**
 * 删除组织（软删除或硬删除）
 * @param id - 组织 ID
 * @param hardDelete - 是否硬删除
 */
export async function deleteOrganization(
  id: string,
  hardDelete: boolean = false
): Promise<void> {
  const params = new URLSearchParams({
    hardDelete: hardDelete.toString(),
  });

  const response = await fetch(
    `${API_BASE_URL}/admin/organizations/${id}?${params}`,
    {
      method: 'DELETE',
    }
  );

  await handleResponse<ApiResponse<void>>(response);
}

/**
 * 获取组织的祖先链（面包屑导航用）
 * @param id - 组织 ID
 */
export async function getOrganizationAncestors(id: string): Promise<Organization[]> {
  const response = await fetch(`${API_BASE_URL}/admin/organizations/${id}/ancestors`);
  const data = await handleResponse<ApiResponse<Organization[]>>(response);
  return data.data || [];
}

// ============================================
// 辅助函数：树形数据处理
// ============================================

/**
 * 将扁平数组转换为树形结构
 */
export function buildOrganizationTree(
  organizations: Organization[],
  parentId: string | null = null
): Organization[] {
  return organizations
    .filter((org) => org.parentId === parentId)
    .map((org) => ({
      ...org,
      children: buildOrganizationTree(organizations, org.id),
    }));
}

/**
 * 从树形结构中查找组织
 */
export function findOrganizationInTree(
  tree: Organization[],
  id: string
): Organization | null {
  for (const org of tree) {
    if (org.id === id) {
      return org;
    }
    if (org.children && org.children.length > 0) {
      const found = findOrganizationInTree(org.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * 获取所有子孙组织的 ID
 */
export function getAllDescendantIds(org: Organization): string[] {
  const ids: string[] = [org.id];
  if (org.children) {
    for (const child of org.children) {
      ids.push(...getAllDescendantIds(child));
    }
  }
  return ids;
}

/**
 * 计算组织的层级深度
 */
export function calculateOrganizationLevel(
  org: Organization,
  allOrgs: Organization[]
): number {
  let level = 0;
  let currentId = org.parentId;

  while (currentId) {
    level++;
    const parent = allOrgs.find((o) => o.id === currentId);
    if (!parent) break;
    currentId = parent.parentId;
  }

  return level;
}

/**
 * 展平树形结构为数组
 */
export function flattenOrganizationTree(tree: Organization[]): Organization[] {
  const result: Organization[] = [];

  function traverse(orgs: Organization[]) {
    for (const org of orgs) {
      result.push(org);
      if (org.children && org.children.length > 0) {
        traverse(org.children);
      }
    }
  }

  traverse(tree);
  return result;
}

export default {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationAncestors,
  buildOrganizationTree,
  findOrganizationInTree,
  getAllDescendantIds,
  calculateOrganizationLevel,
  flattenOrganizationTree,
};
