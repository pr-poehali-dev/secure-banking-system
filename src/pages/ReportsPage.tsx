import { Transaction, Account } from '@/types/bank';
import Icon from '@/components/ui/icon';

interface ReportsPageProps {
  transactions: Transaction[];
  accounts: Account[];
}

const formatMoney = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v);

export default function ReportsPage({ transactions, accounts }: ReportsPageProps) {
  const byType = transactions.reduce((acc, t) => {
    acc[t.typeLabel] = (acc[t.typeLabel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byTypeAmount = transactions.reduce((acc, t) => {
    acc[t.typeLabel] = (acc[t.typeLabel] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const cashOut = transactions.filter(t => t.type === 'cash_out').reduce((s, t) => s + t.amount, 0);
  const cashIn = transactions.filter(t => t.type === 'cash_in').reduce((s, t) => s + t.amount, 0);
  const credits = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);

  const maxAmount = Math.max(...Object.values(byTypeAmount), 1);

  const COLORS: Record<string, string> = {
    'Выдача наличных': 'bg-yellow-400',
    'Взнос наличных': 'bg-blue-400',
    'Выдача кредита': 'bg-purple-400',
    'Выдача рассрочки': 'bg-indigo-400',
    'Выпуск карты': 'bg-cyan-400',
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
          <Icon name="BarChart3" size={20} className="text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Отчёты и аналитика</h1>
          <p className="font-mono text-xs text-muted-foreground">Сводная статистика</p>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Всего операций', value: transactions.length, icon: 'Activity', color: 'text-primary', change: '+12 за сегодня' },
          { label: 'Выдано наличных', value: formatMoney(cashOut), icon: 'ArrowUpFromLine', color: 'text-yellow-400', change: formatMoney(cashOut) },
          { label: 'Принято наличных', value: formatMoney(cashIn), icon: 'ArrowDownToLine', color: 'text-blue-400', change: formatMoney(cashIn) },
          { label: 'Выдано кредитов', value: formatMoney(credits), icon: 'Landmark', color: 'text-purple-400', change: `${transactions.filter(t => t.type === 'credit').length} договоров` },
        ].map((kpi, i) => (
          <div key={i} className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <Icon name={kpi.icon} size={16} className={kpi.color} />
            </div>
            <p className={`text-xl font-semibold font-mono ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{kpi.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h3 className="font-semibold text-sm text-foreground">Операции по типам (сумма)</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(byTypeAmount).map(([label, amount]) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-foreground">{label}</span>
                  <span className="font-mono text-xs text-primary">{formatMoney(amount)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${COLORS[label] || 'bg-primary'} transition-all duration-500`}
                    style={{ width: `${(amount / maxAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Counts */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h3 className="font-semibold text-sm text-foreground">Количество операций по типам</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(byType).map(([label, count]) => (
              <div key={label} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${COLORS[label] || 'bg-primary'}`} />
                  <span className="text-sm text-foreground">{label}</span>
                </div>
                <span className="font-mono text-sm font-semibold text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accounts summary */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h3 className="font-semibold text-sm text-foreground">Сводка по счетам</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Всего счетов', value: accounts.length },
              { label: 'Активных', value: accounts.filter(a => a.status === 'active').length },
              { label: 'Заблокированных', value: accounts.filter(a => a.status === 'blocked').length },
              { label: 'Закрытых', value: accounts.filter(a => a.status === 'closed').length },
            ].map(r => (
              <div key={r.label} className="bg-muted/50 rounded-xl p-3 border border-border/50">
                <p className="font-mono text-xs text-muted-foreground">{r.label}</p>
                <p className="text-xl font-semibold font-mono text-foreground mt-1">{r.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-primary/5 border border-primary/15 rounded-xl">
            <p className="font-mono text-xs text-muted-foreground">Общий баланс по всем счетам</p>
            <p className="font-mono text-lg font-semibold text-primary mt-1">{formatMoney(totalBalance)}</p>
          </div>
        </div>

        {/* Daily activity */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h3 className="font-semibold text-sm text-foreground">Активность сегодня</h3>
          </div>
          <div className="flex flex-col gap-2">
            {transactions
              .filter(t => t.timestamp.startsWith(new Date().toISOString().split('T')[0]))
              .slice(-6)
              .reverse()
              .map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg border border-border/50">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    t.type === 'cash_out' ? 'bg-yellow-400' : t.type === 'cash_in' ? 'bg-blue-400' : 'bg-purple-400'
                  }`} />
                  <span className="text-xs text-foreground flex-1 truncate">{t.typeLabel} · {t.clientName.split(' ')[0]}</span>
                  <span className="font-mono text-xs text-primary">{formatMoney(t.amount)}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(t.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            {transactions.filter(t => t.timestamp.startsWith(new Date().toISOString().split('T')[0])).length === 0 && (
              <p className="text-xs text-muted-foreground font-mono text-center py-4">Операций сегодня нет</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
