import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminNavigation from '../components/AdminNavigation';

function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <AdminNavigation />
      
      {/* 主内容区域 */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
