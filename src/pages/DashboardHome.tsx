import { Employee, Transaction, QueueItem, Account } from '@/types/bank';
import Icon from '@/components/ui/icon';

interface DashboardHomeProps {
  employee: Employee;
  transactions: Transaction[];
  queue: QueueItem[];
  accounts: Account[];
  onSectionChange: (s: string) => void;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

export default function DashboardHome({ employee, transactions, queue, accounts, onSectionChange }: DashboardHomeProps) {
  const todayTxns = transactions.filter(t => t.timestamp.startsWith('2026-03-26'));
  const cashOutToday = todayTxns.filter(t => t.type === 'cash_out').reduce((s, t) => s + t.amount, 0);
  const cashInToday = todayTxns.filter(t => t.type === 'cash_in').reduce((s, t) => s + t.amount, 0);
  const waitingCount = queue.filter(q => q.status === 'waiting').length;
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Доброе утро' : now.getHours() < 18 ? 'Добрый день' : 'Добрый вечер';

  const QUICK_ACTIONS = [
    { id: 'cash_out', label: 'Выдача наличных', icon: 'ArrowUpFromLine', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
    { id: 'cash_in', label: 'Взнос наличных', icon: 'ArrowDownToLine', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    { id: 'queue', label: 'Очередь', icon: 'Users', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    { id: 'credits', label: 'Кредит', icon: 'Landmark', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
    { id: 'clients', label: 'Клиенты', icon: 'UserSquare', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
    { id: 'accounts', label: 'Счета', icon: 'CreditCard', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {greeting}, <span className="text-primary">{employee.name.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-mono">
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/25 rounded-full">
          <div className="status-dot scale-75" />
          <span className="font-mono text-xs text-primary">Рабочий день активен</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Выдано сегодня', value: formatMoney(cashOutToday), icon: 'ArrowUpFromLine', color: 'text-yellow-400', sub: `${todayTxns.filter(t => t.type === 'cash_out').length} операций` },
          { label: 'Принято сегодня', value: formatMoney(cashInToday), icon: 'ArrowDownToLine', color: 'text-blue-400', sub: `${todayTxns.filter(t => t.type === 'cash_in').length} операций` },
          { label: 'В очереди', value: String(waitingCount), icon: 'Users', color: 'text-primary', sub: 'клиентов ожидают' },
          { label: 'Активных счетов', value: String(accounts.filter(a => a.status === 'active').length), icon: 'CreditCard', color: 'text-cyan-400', sub: formatMoney(totalBalance) },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">{stat.label}</p>
              <Icon name={stat.icon} size={16} className={stat.color} />
            </div>
            <p className={`text-2xl font-semibold font-mono ${stat.color}`}>{stat.value}</p>
            <p className="text-muted-foreground text-xs mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">Быстрые действия</p>
        <div className="grid grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.id}
              onClick={() => onSectionChange(action.id)}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border ${action.bg} hover:scale-105 transition-all duration-200 text-center`}
            >
              <Icon name={action.icon} size={22} className={action.color} />
              <span className="text-xs font-medium text-foreground leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent + Queue */}
      <div className="grid grid-cols-2 gap-5">
        {/* Recent transactions */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <h3 className="font-semibold text-sm text-foreground">Последние операции</h3>
            </div>
            <button onClick={() => onSectionChange('history')} className="font-mono text-xs text-primary hover:text-primary/70 transition-colors">
              Все →
            </button>
          </div>
          <div className="space-y-2">
            {transactions.slice(-5).reverse().map(txn => (
              <div key={txn.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  txn.type === 'cash_out' ? 'bg-yellow-400/10' :
                  txn.type === 'cash_in' ? 'bg-blue-400/10' :
                  'bg-purple-400/10'
                }`}>
                  <Icon
                    name={txn.type === 'cash_out' ? 'ArrowUpFromLine' : txn.type === 'cash_in' ? 'ArrowDownToLine' : 'Landmark'}
                    size={12}
                    className={txn.type === 'cash_out' ? 'text-yellow-400' : txn.type === 'cash_in' ? 'text-blue-400' : 'text-purple-400'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{txn.clientName.split(' ')[0]} {txn.clientName.split(' ')[1]}</p>
                  <p className="font-mono text-xs text-muted-foreground">{txn.typeLabel}</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-xs font-semibold ${txn.type === 'cash_out' ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {txn.type === 'cash_out' ? '-' : '+'}{formatMoney(txn.amount)}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">{formatTime(txn.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Queue */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <h3 className="font-semibold text-sm text-foreground">Электронная очередь</h3>
            </div>
            <button onClick={() => onSectionChange('queue')} className="font-mono text-xs text-primary hover:text-primary/70 transition-colors">
              Перейти →
            </button>
          </div>
          <div className="space-y-2">
            {queue.filter(q => q.status === 'waiting').map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className={`w-10 h-7 rounded-md flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold ${
                  i === 0 ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground'
                }`}>
                  {item.ticketNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.clientName}</p>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {item.operations.slice(0, 2).map(op => (
                      <span key={op} className="font-mono text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {op === 'cash_out' ? 'Выдача' : op === 'cash_in' ? 'Взнос' : op === 'card_issue' ? 'Карта' : op === 'credit' ? 'Кредит' : op === 'account_open' ? 'Счёт' : op}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-muted-foreground">
                    {Math.floor((Date.now() - new Date(item.arrivedAt).getTime()) / 60000)} мин
                  </p>
                </div>
              </div>
            ))}
            {queue.filter(q => q.status === 'waiting').length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Icon name="CheckCircle" size={24} className="text-primary mx-auto mb-2" />
                <p className="text-xs font-mono">Очередь пуста</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
