import { NavLink, Outlet } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { LayoutDashboard, Building2, ShoppingCart, Package, Users, ShoppingBag } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/etudes', label: 'Études', icon: Building2 },
  { to: '/achats', label: 'Achats', icon: ShoppingCart },
  { to: '/objets', label: 'Objets', icon: Package },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/ventes', label: 'Ventes', icon: ShoppingBag },
]

export default function Layout() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="none">
        <SidebarHeader>
          <div className="px-4 py-3">
            <div className="text-base font-semibold tracking-tight">Auction</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Manager</div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map(item => (
              <SidebarMenuItem key={item.to}>
                <NavLink to={item.to} end={item.to === '/'}>
                  {({ isActive }) => (
                    <SidebarMenuButton isActive={isActive}>
                      <item.icon className="size-4" />
                      {item.label}
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-4 py-2 text-xs text-muted-foreground">v2.0 · Local</div>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 p-8 min-h-screen overflow-auto">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
