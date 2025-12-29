import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Settings, 
  LogOut, 
  Snowflake,
  Sun,
  Moon,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { Logo } from './Logo';

const Layout: React.FC = () => {
  const { mode, season, toggleMode, toggleSeason } = useTheme();
  const { currentUser, logout } = useApp();
  const location = useLocation();
  
  // Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Desktop Resizable Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(288); // Default 288px (w-72)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Generate snow particles
  const snowflakes = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      // Slower duration for a more peaceful feel (15-30s)
      animationDuration: `${Math.random() * 15 + 15}s`, 
      // Negative delay ensures screen is full on load
      animationDelay: `${Math.random() * -30}s`,
      // Varying opacity for depth
      opacity: Math.random() * 0.5 + 0.1,
      // Varying sizes
      size: Math.random() * 5 + 3,
      // Blur for "bokeh" depth effect
      blur: Math.random() > 0.6 ? 2 : 0
    }));
  }, []);

  // Resizing Logic
  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
        let newWidth = e.clientX;
        if (newWidth < 200) newWidth = 200; // Min width
        if (newWidth > 480) newWidth = 480; // Max width
        setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    } else {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }
    return () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    };
  }, [isResizing, resize, stopResizing]);

  if (!currentUser) return <Outlet />;

  const isWinter = season === 'winter';

  // CSS Variable for Sidebar Width
  const layoutStyle = {
    '--sidebar-width': isSidebarVisible ? `${sidebarWidth}px` : '0px',
  } as React.CSSProperties;

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isWinter ? 'bg-gray-50 dark:bg-neutral-950' : 'bg-gray-50 dark:bg-neutral-900'}`} style={layoutStyle}>
      {/* Snow Effect for Winter */}
      {isWinter && (
        <>
            <style>
                {`
                    @keyframes gentle-snow {
                        0% { transform: translate3d(0, -10vh, 0); }
                        25% { transform: translate3d(30px, 25vh, 0); }
                        50% { transform: translate3d(-30px, 50vh, 0); }
                        75% { transform: translate3d(30px, 75vh, 0); }
                        100% { transform: translate3d(0, 110vh, 0); }
                    }
                `}
            </style>
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
                {snowflakes.map(flake => (
                <div
                    key={flake.id}
                    className="absolute rounded-full bg-blue-300 dark:bg-slate-200"
                    style={{
                        left: flake.left,
                        top: -20,
                        width: `${flake.size}px`,
                        height: `${flake.size}px`,
                        opacity: flake.opacity,
                        filter: `blur(${flake.blur}px)`,
                        animation: `gentle-snow ${flake.animationDuration} linear infinite`,
                        animationDelay: flake.animationDelay,
                    }}
                />
                ))}
            </div>
        </>
      )}

      {/* Mobile/Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`
            fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r backdrop-blur-xl shadow-2xl lg:shadow-none 
            transition-transform duration-300 ease-in-out lg:transition-none
            w-72 lg:w-[var(--sidebar-width)]
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            ${isWinter 
            ? 'bg-white/90 border-gray-200 dark:bg-neutral-900/90 dark:border-neutral-800' 
            : 'bg-white/95 border-gray-200 dark:bg-neutral-900/95 dark:border-neutral-800'
            }
            ${!isSidebarVisible ? 'lg:border-none' : ''}
        `}
      >
        <div className={`flex flex-col h-full overflow-hidden ${!isSidebarVisible ? 'lg:hidden' : ''}`}>
            <div className="p-6">
            <div className="flex items-center justify-between mb-10">
                <Logo className="h-10 w-auto" />
                
                {/* Mobile Close */}
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition lg:hidden">
                    <X size={20} />
                </button>

                {/* Desktop Collapse */}
                <button onClick={() => setIsSidebarVisible(false)} className="hidden lg:block p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition" title="Collapse Sidebar">
                    <PanelLeftClose size={18} />
                </button>
            </div>

            <nav className="space-y-2">
                <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/" icon={<LayoutDashboard size={20} />} label="Overview" active={location.pathname === '/'} winter={isWinter} />
                <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/space" icon={<Users size={20} />} label="TaskSpace" active={location.pathname === '/space'} winter={isWinter} />
                <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/calendar" icon={<CalendarDays size={20} />} label="Calendar" active={location.pathname === '/calendar'} winter={isWinter} />
                <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/settings" icon={<Settings size={20} />} label="Settings" active={location.pathname === '/settings'} winter={isWinter} />
            </nav>
            </div>

            <div className="mt-auto p-6 border-t border-gray-100 dark:border-neutral-800 space-y-4">
            <div className="flex items-center gap-2">
                <button onClick={toggleMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition">
                    {mode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <button onClick={toggleSeason} className={`p-2 rounded-lg transition ${isWinter ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-neutral-800'}`}>
                    <Snowflake size={18} />
                </button>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
                <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-700 shadow-sm flex-shrink-0" />
                <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <button onClick={logout} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
                    <LogOut size={12} /> Sign out
                </button>
                </div>
            </div>
            </div>
        </div>

        {/* Resize Handle (Desktop Only) - No visual effect */}
        {isSidebarVisible && (
            <div 
                className="hidden lg:block absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-50"
                onMouseDown={startResizing}
            />
        )}
      </aside>

      {/* Main Content */}
      <main 
        className={`
            flex-1 overflow-y-auto relative z-10 w-full transition-[margin] duration-300 ease-in-out
            lg:ml-[var(--sidebar-width)]
            ${isResizing ? 'transition-none select-none pointer-events-none' : ''}
        `}
      >
        <div className={`max-w-7xl mx-auto p-4 md:p-8 pt-16 ${!isSidebarVisible ? 'lg:pt-20' : 'lg:pt-8'}`}>
            {/* Mobile Toggle */}
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-gray-100 dark:border-neutral-700 text-gray-700 dark:text-gray-200"
            >
                <Menu size={20} />
            </button>
            
            {/* Desktop Expand Button (Visible only when sidebar is collapsed) */}
            {!isSidebarVisible && (
                <button 
                    onClick={() => setIsSidebarVisible(true)}
                    className="hidden lg:flex fixed top-4 left-4 z-40 p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 text-gray-500 hover:text-black dark:hover:text-white transition"
                    title="Expand Sidebar"
                >
                    <PanelLeftOpen size={20} />
                </button>
            )}

            <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean; winter: boolean; onClick?: () => void }> = ({ to, icon, label, active, winter, onClick }) => {
  const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200 group whitespace-nowrap overflow-hidden";
  const activeClasses = winter 
    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
    : "bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md";
  const inactiveClasses = "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-white";

  return (
    <NavLink onClick={onClick} to={to} className={active ? `${baseClasses} ${activeClasses}` : `${baseClasses} ${inactiveClasses}`}>
      <div className="flex-shrink-0">{icon}</div>
      <span>{label}</span>
    </NavLink>
  );
};

export default Layout;