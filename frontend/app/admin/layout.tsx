'use client';

import React, { useState } from 'react';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileSidebar } from '@/components/admin/AdminMobileSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Topbar */}
      <AdminTopbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      </div>

      {/* Mobile Sidebar */}
      <AdminMobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      {/* Main Content */}
      <main 
        className={`flex-1 pt-16 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
