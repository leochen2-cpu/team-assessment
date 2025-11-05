/**
 * 组织管理路由
 * 
 * 提供组织的 CRUD 操作和层级查询功能
 * 路径: /api/admin/organizations
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// 辅助函数：构建组织树形结构
// ============================================
interface OrganizationNode {
  id: string;
  name: string;
  description: string | null;
  leaderName: string;
  leaderEmail: string;
  parentId: string | null;
  createdAt: Date;
  isActive: boolean;
  children?: OrganizationNode[];
  assessmentCount?: number;
  completedAssessmentCount?: number;
}

/**
 * 递归构建组织树
 */
function buildOrganizationTree(
  organizations: any[],
  parentId: string | null = null
): OrganizationNode[] {
  return organizations
    .filter((org) => org.parentId === parentId)
    .map((org) => ({
      ...org,
      children: buildOrganizationTree(organizations, org.id),
    }));
}

// ============================================
// GET /api/admin/organizations
// 获取所有组织（可选：层级结构或扁平列表）
// ============================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { format = 'tree', includeInactive = 'false' } = req.query;

    // 查询条件
    const where = includeInactive === 'true' ? {} : { isActive: true };

    // 获取所有组织及其关联数据
    const organizations = await prisma.organization.findMany({
      where,
      include: {
        _count: {
          select: {
            assessments: true,
            children: true,
          },
        },
        assessments: {
          select: {
            id: true,
            teamReport: {
              select: {
                teamScore: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 增强数据：添加评估统计
    const enhancedOrgs = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      description: org.description,
      leaderName: org.leaderName,
      leaderEmail: org.leaderEmail,
      leaderPhone: org.leaderPhone,
      parentId: org.parentId,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      createdBy: org.createdBy,
      isActive: org.isActive,
      assessmentCount: org._count.assessments,
      completedAssessmentCount: org.assessments.filter(
        (a) => a.teamReport !== null
      ).length,
      childrenCount: org._count.children,
    }));

    // 根据格式返回数据
    if (format === 'tree') {
      const tree = buildOrganizationTree(enhancedOrgs);
      res.json({
        success: true,
        data: tree,
        format: 'tree',
      });
    } else {
      res.json({
        success: true,
        data: enhancedOrgs,
        format: 'flat',
      });
    }
  } catch (error) {
    console.error('获取组织列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取组织列表失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

// ============================================
// GET /api/admin/organizations/:id
// 获取单个组织的详细信息
// ============================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeChildren = 'true', includeAssessments = 'true' } = req.query;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        parent: true,
        children: includeChildren === 'true' ? {
          include: {
            _count: {
              select: {
                assessments: true,
              },
            },
          },
        } : false,
        assessments: includeAssessments === 'true' ? {
          include: {
            teamReport: true,
            _count: {
              select: {
                codes: true,
              },
            },
            codes: {
              where: {
                isUsed: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        } : false,
        summaryReports: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // 只获取最新的汇总报告
        },
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: '组织不存在',
      });
    }

    // 计算统计信息
    const stats = {
      totalAssessments: organization.assessments?.length || 0,
      completedAssessments:
        organization.assessments?.filter((a) => a.teamReport !== null).length || 0,
      pendingAssessments:
        organization.assessments?.filter((a) => a.teamReport === null).length || 0,
      totalParticipants:
        organization.assessments?.reduce((sum, a) => sum + a.memberCount, 0) || 0,
      completedParticipants:
        organization.assessments?.reduce(
          (sum, a) => sum + (a.codes?.length || 0),
          0
        ) || 0,
      childrenCount: organization.children?.length || 0,
      hasLatestReport: (organization.summaryReports?.length || 0) > 0,
    };

    res.json({
      success: true,
      data: {
        ...organization,
        stats,
      },
    });
  } catch (error) {
    console.error('获取组织详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取组织详情失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

// ============================================
// POST /api/admin/organizations
// 创建新组织
// ============================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      parentId,
      leaderName,
      leaderEmail,
      leaderPhone,
      createdBy = 'admin',
    } = req.body;

    // 验证必填字段
    if (!name || !leaderName || !leaderEmail) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：name, leaderName, leaderEmail',
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leaderEmail)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确',
      });
    }

    // 如果有 parentId，验证父组织是否存在
    if (parentId) {
      const parentOrg = await prisma.organization.findUnique({
        where: { id: parentId },
      });

      if (!parentOrg) {
        return res.status(404).json({
          success: false,
          message: '父组织不存在',
        });
      }

      if (!parentOrg.isActive) {
        return res.status(400).json({
          success: false,
          message: '父组织已被禁用，无法添加子组织',
        });
      }
    }

    // 创建组织
    const organization = await prisma.organization.create({
      data: {
        name,
        description: description || null,
        parentId: parentId || null,
        leaderName,
        leaderEmail,
        leaderPhone: leaderPhone || null,
        createdBy,
        isActive: true,
      },
      include: {
        parent: true,
      },
    });

    res.status(201).json({
      success: true,
      message: '组织创建成功',
      data: organization,
    });
  } catch (error) {
    console.error('创建组织失败:', error);
    res.status(500).json({
      success: false,
      message: '创建组织失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

// ============================================
// PUT /api/admin/organizations/:id
// 更新组织信息
// ============================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      parentId,
      leaderName,
      leaderEmail,
      leaderPhone,
      isActive,
    } = req.body;

    // 检查组织是否存在
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!existingOrg) {
      return res.status(404).json({
        success: false,
        message: '组织不存在',
      });
    }

    // 验证邮箱格式（如果提供）
    if (leaderEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(leaderEmail)) {
        return res.status(400).json({
          success: false,
          message: '邮箱格式不正确',
        });
      }
    }

    // 如果要更改 parentId，进行额外验证
    if (parentId !== undefined && parentId !== existingOrg.parentId) {
      // 不能将自己设为父组织
      if (parentId === id) {
        return res.status(400).json({
          success: false,
          message: '不能将组织设为自己的父组织',
        });
      }

      // 验证新父组织是否存在
      if (parentId) {
        const newParent = await prisma.organization.findUnique({
          where: { id: parentId },
        });

        if (!newParent) {
          return res.status(404).json({
            success: false,
            message: '新的父组织不存在',
          });
        }

        // 防止循环引用（不能将父组织设为自己的子孙组织）
        let checkParent = newParent;
        while (checkParent.parentId) {
          if (checkParent.parentId === id) {
            return res.status(400).json({
              success: false,
              message: '不能创建循环的组织层级关系',
            });
          }
          const nextParent = await prisma.organization.findUnique({
            where: { id: checkParent.parentId },
          });
          if (!nextParent) break;
          checkParent = nextParent;
        }
      }
    }

    // 如果要禁用组织，检查是否有活跃的子组织
    if (isActive === false && existingOrg.isActive) {
      const activeChildren = existingOrg.children.filter((child) => child.isActive);
      if (activeChildren.length > 0) {
        return res.status(400).json({
          success: false,
          message: `无法禁用组织，请先禁用或移除 ${activeChildren.length} 个活跃的子组织`,
        });
      }
    }

    // 更新组织
    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(parentId !== undefined && { parentId }),
        ...(leaderName !== undefined && { leaderName }),
        ...(leaderEmail !== undefined && { leaderEmail }),
        ...(leaderPhone !== undefined && { leaderPhone }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        parent: true,
        children: true,
      },
    });

    res.json({
      success: true,
      message: '组织更新成功',
      data: updatedOrg,
    });
  } catch (error) {
    console.error('更新组织失败:', error);
    res.status(500).json({
      success: false,
      message: '更新组织失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

// ============================================
// DELETE /api/admin/organizations/:id
// 删除组织（软删除或硬删除）
// ============================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hardDelete = 'false' } = req.query;

    // 检查组织是否存在
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        children: true,
        assessments: true,
        summaryReports: true,
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: '组织不存在',
      });
    }

    // 检查是否有子组织
    const activeChildren = organization.children.filter((child) => child.isActive);
    if (activeChildren.length > 0) {
      return res.status(400).json({
        success: false,
        message: `无法删除组织，请先删除或移除 ${activeChildren.length} 个子组织`,
      });
    }

    if (hardDelete === 'true') {
      // 硬删除：物理删除数据
      // 注意：需要先删除关联数据
      if (organization.assessments.length > 0) {
        return res.status(400).json({
          success: false,
          message: `无法硬删除组织，该组织下有 ${organization.assessments.length} 个评估。请先删除评估或使用软删除。`,
        });
      }

      // 删除汇总报告
      if (organization.summaryReports.length > 0) {
        await prisma.summaryReport.deleteMany({
          where: { organizationId: id },
        });
      }

      // 删除组织
      await prisma.organization.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: '组织已永久删除',
        deleteType: 'hard',
      });
    } else {
      // 软删除：只标记为不活跃
      const updatedOrg = await prisma.organization.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: '组织已禁用（软删除）',
        deleteType: 'soft',
        data: updatedOrg,
      });
    }
  } catch (error) {
    console.error('删除组织失败:', error);
    res.status(500).json({
      success: false,
      message: '删除组织失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

// ============================================
// GET /api/admin/organizations/:id/ancestors
// 获取组织的所有祖先（面包屑导航用）
// ============================================
router.get('/:id/ancestors', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ancestors: any[] = [];
    let currentId: string | null = id;

    // 递归查找所有祖先
    while (currentId) {
      const org = await prisma.organization.findUnique({
        where: { id: currentId },
        select: {
          id: true,
          name: true,
          parentId: true,
        },
      });

      if (!org) break;

      ancestors.unshift(org); // 添加到数组开头
      currentId = org.parentId;
    }

    res.json({
      success: true,
      data: ancestors,
    });
  } catch (error) {
    console.error('获取祖先组织失败:', error);
    res.status(500).json({
      success: false,
      message: '获取祖先组织失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

export default router;
