'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavBar = () => {
  const pathname = usePathname();

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: '📊'
    },
    {
      name: 'Category',
      href: '/admin/dashboard/category',
      icon: '📦'
    },
    {
      name: 'Sub-Category',
      href: '/admin/dashboard/subCategory',
      icon: '🛍️'
    },
    {
      name: 'Brand',
      href: '/admin/dashboard/brand',
      icon: '👥'
    },
    {
      name: 'Modal',
      href: '/admin/dashboard/modal',
      icon: '⚙️'
    },
    {
      name: 'Purchase Method',
      href: '/admin/dashboard/mop',
      icon: '⚙️'
    },
    {
      name: 'Vendor',
      href: '/admin/dashboard/vendor',
      icon: '👥'
    },
    {
      name: 'Stock Entry',
      href: '/admin/dashboard/stock',
      icon: '📦'
    },
    {
      name: 'User',
      href: '/admin/dashboard/user',
      icon: '🛍️'
    },{
      name: 'Issue-Stock',
      href: '/admin/dashboard/issue',
      icon: '🛍️'
    },
  ];

  return (
    <nav className="h-screen bg-gray-800 text-white w-full">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-64px)]">
        <ul className="space-y-2 p-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  pathname === link.href
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-gray-700'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};


export default NavBar;