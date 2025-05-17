'use client';

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function MainLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 sidebar-collapsed:ml-20 transition-all duration-300">
        <Header />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
