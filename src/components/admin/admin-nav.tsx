
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_NAVIGATION, type AdminNavItem } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const toggleSubMenu = (itemName: string) => {
    setOpenSubMenus(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  // Effect to open parent menu if a sub-item is active on initial load or navigation
  React.useEffect(() => {
    ADMIN_NAVIGATION.forEach(item => {
      if (item.subItems) {
        const isAnySubItemActive = item.subItems.some(subItem => pathname.startsWith(subItem.href));
        if (isAnySubItemActive && !openSubMenus[item.name]) {
          setOpenSubMenus(prev => ({ ...prev, [item.name]: true }));
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Only re-run if pathname changes

  const renderNavItem = (item: AdminNavItem, isSubItem: boolean = false) => {
    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin/dashboard' && !item.subItems);
    const isSubMenuOpen = openSubMenus[item.name] || false;

    if (item.subItems) {
      return (
        <Button
          key={item.name}
          variant={"ghost"} // Parent toggles are always ghost
          className={cn(
            "w-full justify-between text-left mb-1", // Changed to justify-between for icon
            // No specific active styling for parent toggles, sub-item will show active
          )}
          onClick={() => toggleSubMenu(item.name)}
        >
          <div className="flex items-center">
            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
            {item.name}
          </div>
          {isSubMenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      );
    }

    return (
      <Link key={item.name} href={item.href} passHref>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={cn(
            "w-full justify-start text-left mb-1",
            isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
            // isSubItem styling removed for direct alignment
          )}
        >
          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
          {item.name}
        </Button>
      </Link>
    );
  };

  return (
    <nav className="grid items-start gap-1">
      {ADMIN_NAVIGATION.map((item) => (
        <React.Fragment key={item.name}>
          {renderNavItem(item)}
          {item.subItems && openSubMenus[item.name] && (
            <div className="ml-0 mt-1 mb-2"> {/* Removed indentation and border, added slight top/bottom margin */}
              {item.subItems.map((subItem) => renderNavItem(subItem, true))}
            </div>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
