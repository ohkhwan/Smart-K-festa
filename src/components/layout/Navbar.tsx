
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { cn } from '@/lib/utils';
import { BarChart3, Lightbulb, Map, FileText, Presentation } from 'lucide-react'; // Added Presentation

const menuItems = [
  { href: '/', label: 'AI 축제 컨설팅', icon: Lightbulb },
  { href: '/congestion-forecast', label: 'AI 축제 방문객 예측', icon: BarChart3 },
  { href: '/realtime-dashboard', label: '실시간 축제 현황분석', icon: Map },
  { href: '/satisfaction-report', label: '축제 만족도 리포트', icon: FileText },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Presentation className="h-6 w-6" />
          <span>Localytics AI</span>
        </Link>
        <Menubar className="border-none bg-transparent shadow-none">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <MenubarMenu key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <MenubarTrigger
                    className={cn(
                      "cursor-pointer text-sm font-medium flex items-center gap-2",
                      isActive ? "text-primary bg-accent/50" : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </MenubarTrigger>
                </Link>
              </MenubarMenu>
            );
          })}
        </Menubar>
      </div>
    </header>
  );
}
