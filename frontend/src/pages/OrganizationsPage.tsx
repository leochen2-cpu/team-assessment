/**
 * 组织管理页面
 * 
 * 放置位置: frontend/src/pages/OrganizationsPage.tsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Organization, OrganizationFormData } from '../types/organization';
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  flattenOrganizationTree,
} from '../service/organizationService';
import { OrganizationTree } from '../components/OrganizationTree';
import { OrganizationForm } from '../components/OrganizationForm';
import { OrganizationStats } from '../components/SummaryStats';

type ModalMode = 'create' | 'edit' | 'delete' | null;

/**
 * 组织管理页面
 */
export const OrganizationsPage: React.FC = () => {
  const navigate = useNavigate();

  // 状态管理
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [flatOrgs, setFlatOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 模态框状态
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [parentIdForCreate, setParentIdForCreate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 搜索和筛选
  const [searchQuery, setSearchQuery] = useState('');

  // 加载组织数据
  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getOrganizations('tree', false);
      setOrganizations(data);
      
      // 同时保存扁平化版本用于搜索和父组织选择
      const flat = flattenOrganizationTree(data);
      setFlatOrgs(flat);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载组织失败';
      setError(errorMessage);
      console.error('Failed to load organizations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // 打开创建模态框
  const handleCreate = (parentId: string | null = null) => {
    setModalMode('create');
    setParentIdForCreate(parentId);
    setSelectedOrg(null);
  };

  // 打开编辑模态框
  const handleEdit = (org: Organization) => {
    setModalMode('edit');
    setSelectedOrg(org);
    setParentIdForCreate(null);
  };

  // 打开删除确认模态框
  const handleDeleteClick = (org: Organization) => {
    setModalMode('delete');
    setSelectedOrg(org);
  };

  // 关闭模态框
  const closeModal = () => {
    setModalMode(null);
    setSelectedOrg(null);
    setParentIdForCreate(null);
  };

  // 创建或编辑组织
  const handleSubmit = async (formData: OrganizationFormData) => {
    try {
      setIsSubmitting(true);
      
      if (modalMode === 'create') {
        await createOrganization(formData);
        alert('Organization has been created');
      } else if (modalMode === 'edit' && selectedOrg) {
        await updateOrganization(selectedOrg.id, formData);
        alert('Organization has been updated');
      }
      
      await fetchOrganizations();
      closeModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error';
      alert(`Error：${errorMessage}`);
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除组织
  const handleDelete = async () => {
    if (!selectedOrg) return;

    try {
      setIsSubmitting(true);
      await deleteOrganization(selectedOrg.id, false); // 软删除
      alert('Organization has been deletd');
      await fetchOrganizations();
      closeModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete';
      alert(`Error：${errorMessage}`);
      console.error('Delete error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 选择组织（查看详情）
  const handleSelectOrg = (org: Organization) => {
    setSelectedOrg(org);
  };

  // 查看汇总报告
  const handleViewSummary = (org: Organization) => {
    navigate(`/admin/organization/${org.id}/summary`);
  };

  // 计算统计数据
  const totalOrgs = flatOrgs.length;
  const activeOrgs = flatOrgs.filter((org) => org.isActive).length;
  const totalAssessments = flatOrgs.reduce((sum, org) => sum + (org.assessmentCount || 0), 0);
  const completedAssessments = flatOrgs.reduce(
    (sum, org) => sum + (org.completedAssessmentCount || 0),
    0
  );

  // 搜索过滤
  const filteredOrgs = searchQuery
    ? flatOrgs.filter(
        (org) =>
          org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.leaderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : organizations;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题和操作栏 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organization Management</h1>
              <p className="mt-2 text-gray-600">Organization structure and team assessment</p>
            </div>
            <button
              onClick={() => handleCreate(null)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create
            </button>
          </div>

          {/* 搜索栏 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for group name or manager..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <OrganizationStats
          totalOrganizations={totalOrgs}
          totalAssessments={totalAssessments}
          completedAssessments={completedAssessments}
          activeOrganizations={activeOrgs}
        />

        {/* 组织树形列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-center">
              <svg
                className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchOrganizations}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <OrganizationTree
            organizations={filteredOrgs as Organization[]}
            onSelect={handleSelectOrg}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onAddChild={(org) => handleCreate(org.id)}
            selectedId={selectedOrg?.id}
          />
        )}

        {/* 选中组织的详情面板 */}
        {selectedOrg && !searchQuery && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedOrg.name}
                </h3>
                {selectedOrg.description && (
                  <p className="mt-1 text-gray-600">{selectedOrg.description}</p>
                )}
              </div>
              <button
                onClick={handleViewSummary.bind(null, selectedOrg)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                View report
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Manager</p>
                <p className="font-medium text-gray-900">{selectedOrg.leaderName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{selectedOrg.leaderEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assessment Count</p>
                <p className="font-medium text-gray-900">
                  {selectedOrg.completedAssessmentCount || 0} / {selectedOrg.assessmentCount || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sub-organization</p>
                <p className="font-medium text-gray-900">
                  {selectedOrg.children?.length || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 创建/编辑模态框 */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' ? 'Create' : 'Edit'}
              </h2>
            </div>
            <div className="px-6 py-4">
              <OrganizationForm
                mode={modalMode}
                organization={selectedOrg || undefined}
                parentId={parentIdForCreate}
                organizations={flatOrgs}
                onSubmit={handleSubmit}
                onCancel={closeModal}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {modalMode === 'delete' && selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comfirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Do you want to delete <strong>{selectedOrg.name}</strong> ?
              {selectedOrg.children && selectedOrg.children.length > 0 && (
                <span className="block mt-2 text-red-600">
                  Notice：This organization has {selectedOrg.children.length} sub-organizations
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Comfirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationsPage;