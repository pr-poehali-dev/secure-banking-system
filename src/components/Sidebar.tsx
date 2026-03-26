import { Employee, AppSection } from '@/types/bank';
import Icon from '@/components/ui/icon';

interface SidebarProps {
  employee: Employee;
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: AppSection; label: string; icon: string; badge?: string }[] = [
  { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard' },
  { id: 'queue', label: 'Электронная очередь', icon: 'Users' },
  { id: 'cash_out', label: 'Выдача наличных', icon: 'ArrowUpFromLine' },
  { id: 'cash_in', label: 'Взнос наличных', icon: 'ArrowDownToLine' },
  { id: 'credits', label: 'Кредит / Рассрочка', icon: 'Landmark' },
  { id: 'clients', label: 'Клиентская база', icon: 'UserSquare' },
  { id: 'accounts', label: 'Учёт счетов', icon: 'CreditCard' },
  { id: 'history', label: 'История операций', icon: 'History' },
  { id: 'reports', label: 'Отчёты и аналитика', icon: 'BarChart3' },
  { id: 'terminal', label: 'Терминал СБЕР', icon: 'Monitor' },
  { id: 'profile', label: 'Личный кабинет', icon: 'UserCog' },
];

export default function Sidebar({ employee, activeSection, onSectionChange, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center scan-line flex-shrink-0">
            <Icon name="Building2" size={16} className="text-primary" />
          </div>
          <div>
            <p className="font-mono text-xs font-semibold text-foreground leading-none">АС ЕФС</p>
            <p className="font-mono text-xs text-primary leading-none mt-0.5">СБОЛ.про</p>
          </div>
        </div>
      </div>

      {/* Employee info */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-xs font-semibold text-primary">
              {employee.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate leading-tight">{employee.name}</p>
            <p className="font-mono text-xs text-muted-foreground truncate leading-tight mt-0.5">{employee.roleLabel}</p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <div className="status-dot scale-75" />
          <span className="font-mono text-xs text-primary/80">ОНЛАЙН</span>
          <span className="font-mono text-xs text-muted-foreground ml-auto">{employee.tabNumber}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-150 group ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground border border-transparent'
                }`}
              >
                <Icon
                  name={item.icon}
                  size={16}
                  className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
                />
                <span className="text-sm font-medium truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-sidebar-border">
        <div className="px-3 py-2 mb-2">
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={12} className="text-primary/60" />
            <span className="font-mono text-xs text-muted-foreground/50">ЗАЩИЩЁННЫЙ СЕАНС</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 border border-transparent"
        >
          <Icon name="LogOut" size={16} />
          <span className="text-sm font-medium">Выйти</span>
        </button>
      </div>
    </aside>
  );
}
