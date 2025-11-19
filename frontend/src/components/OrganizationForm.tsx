/**
 * 组织表单组件（创建/编辑）
 * 
 * 放置位置: frontend/src/components/OrganizationForm.tsx
 */

import React, { useState, useEffect } from 'react';
import { Organization, OrganizationFormData } from '../types/organization';

interface OrganizationFormProps {
  mode: 'create' | 'edit';
  organization?: Organization;
  parentId?: string | null;
  organizations?: Organization[]; // 用于选择父组织
  onSubmit: (data: OrganizationFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * 组织表单组件
 */
export const OrganizationForm: React.FC<OrganizationFormProps> = ({
  mode,
  organization,
  parentId,
  organizations = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    description: '',
    parentId: parentId || null,
    leaderName: '',
    leaderEmail: '',
    leaderPhone: '',
    createdBy: 'admin',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 编辑模式：填充表单
  useEffect(() => {
    if (mode === 'edit' && organization) {
      setFormData({
        name: organization.name,
        description: organization.description || '',
        parentId: organization.parentId || null,
        leaderName: organization.leaderName,
        leaderEmail: organization.leaderEmail,
        leaderPhone: organization.leaderPhone || '',
        createdBy: organization.createdBy,
      });
    }
  }, [mode, organization]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name cannot be empty';
    }

    if (!formData.leaderName.trim()) {
      newErrors.leaderName = 'The name of manager cannot be empty.';
    }

    if (!formData.leaderEmail.trim()) {
      newErrors.leaderEmail = 'Manager email cannot be empty';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leaderEmail)) {
      newErrors.leaderEmail = 'Email format is incorrect';
    }

    if (formData.leaderPhone && !/^[\d\s\-\+\(\)]+$/.test(formData.leaderPhone)) {
      newErrors.leaderPhone = 'Phone number format is incorrect';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // 更新字段
  const updateField = (field: keyof OrganizationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 获取可选的父组织列表（排除自己和自己的子组织）
  const getAvailableParents = () => {
    if (mode === 'create') {
      return organizations;
    }

    // 编辑模式：排除自己和自己的后代
    const excludeIds = new Set<string>();
    if (organization) {
      excludeIds.add(organization.id);
      
      // 递归添加所有后代ID
      const addDescendants = (org: Organization) => {
        if (org.children) {
          org.children.forEach((child) => {
            excludeIds.add(child.id);
            addDescendants(child);
          });
        }
      };
      addDescendants(organization);
    }

    return organizations.filter((org) => !excludeIds.has(org.id));
  };

  const availableParents = getAvailableParents();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 组织名称 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="For example: technical department"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* 组织描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization description （optional）
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Briefly describe the organization's responsibilities and goals..."
          disabled={isSubmitting}
        />
      </div>

      {/* 父组织选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Superior organization （optional）
        </label>
        <select
          value={formData.parentId || ''}
          onChange={(e) => updateField('parentId', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting || (mode === 'create' && !!parentId)}
        >
          <option value="">Top-level organization（no superior）</option>
          {availableParents.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        {mode === 'create' && parentId && (
          <p className="mt-1 text-sm text-gray-500">
            Created as a sub-organization of the selected organization
          </p>
        )}
      </div>

      {/* 分隔线 */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Manager Information</h3>
      </div>

      {/* 负责人姓名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Manager Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.leaderName}
          onChange={(e) => updateField('leaderName', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.leaderName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Example: John"
          disabled={isSubmitting}
        />
        {errors.leaderName && (
          <p className="mt-1 text-sm text-red-600">{errors.leaderName}</p>
        )}
      </div>

      {/* 负责人邮箱 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Manager email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.leaderEmail}
          onChange={(e) => updateField('leaderEmail', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.leaderEmail ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Example：john@company.com"
          disabled={isSubmitting}
        />
        {errors.leaderEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.leaderEmail}</p>
        )}
      </div>

      {/* 负责人电话 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Manager phone（optional）
        </label>
        <input
          type="tel"
          value={formData.leaderPhone}
          onChange={(e) => updateField('leaderPhone', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.leaderPhone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Example：4151234567"
          disabled={isSubmitting}
        />
        {errors.leaderPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.leaderPhone}</p>
        )}
      </div>

      {/* 按钮组 */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && (
            <svg
              className="animate-spin h-4 w-4 text-white"
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
          )}
          {mode === 'create' ? 'Create organization' : 'Save changes'}
        </button>
      </div>
    </form>
  );
};

export default OrganizationForm;