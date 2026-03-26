import { Employee } from '@/types/bank';
import Icon from '@/components/ui/icon';

interface ProfilePageProps {
  employee: Employee;
}

export default function ProfilePage({ employee }: ProfilePageProps) {
  const initials = employee.name.split(' ').map(w => w[0]).slice(0, 2).join('');

  return (
    <div className="p-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
          <Icon name="UserCog" size={20} className="text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Личный кабинет</h1>
      </div>

      <div className="glass-card rounded-2xl p-8 mb-5">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/25 flex items-center justify-center scan-line">
            <span className="font-mono text-2xl font-bold text-primary">{initials}</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{employee.name}</h2>
            <p className="text-primary font-mono text-sm mt-0.5">{employee.roleLabel}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="status-dot scale-75" />
              <span className="font-mono text-xs text-muted-foreground">Сессия активна</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Логин', value: employee.login, icon: 'User' },
            { label: 'Табельный номер', value: employee.tabNumber, icon: 'Hash' },
            { label: 'Отдел', value: employee.department, icon: 'Building2' },
            { label: 'Роль', value: employee.roleLabel, icon: 'Shield' },
          ].map(field => (
            <div key={field.label} className="bg-muted/50 rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon name={field.icon} size={13} className="text-muted-foreground" />
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{field.label}</p>
              </div>
              <p className="font-semibold text-foreground">{field.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <h3 className="font-semibold text-sm text-foreground">Права доступа</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Выдача наличных (ОКУД 0402009)',
            'Приём наличных (ОКУД 0402008)',
            'Управление очередью',
            'Выпуск кредитов и рассрочек',
            'Выпуск банковских карт',
            'Открытие счетов',
            'Просмотр клиентской базы',
            'Добавление клиентов',
            'Просмотр отчётов',
            'Управление счетами',
          ].map(perm => (
            <div key={perm} className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-lg border border-primary/10">
              <Icon name="CheckCircle" size={13} className="text-primary flex-shrink-0" />
              <span className="text-xs text-foreground">{perm}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
