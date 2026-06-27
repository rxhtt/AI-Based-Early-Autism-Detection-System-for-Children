import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Users, Settings, LogOut, FileText, BarChart3, Menu } from 'lucide-react';
import { Button } from './components/ui/button';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Patients', path: '/patients/new', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-zinc-300 flex flex-col">
        <div className="h-20 flex flex-col justify-center px-6 border-b border-zinc-800">
          <div className="flex items-center text-white font-semibold tracking-wide">
            <Activity className="w-5 h-5 text-blue-400 mr-2" />
            AURA Clinical
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest pl-7">
            By Rohit Bagewadi
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button onClick={handleLogout} className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 w-full transition-colors">
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8">
          <div className="font-semibold text-zinc-800 truncate">
             {navItems.find(n => location.pathname.startsWith(n.path))?.name || "Application"}
          </div>
          <div className="flex items-center space-x-4">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                DR
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-zinc-50/50 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
