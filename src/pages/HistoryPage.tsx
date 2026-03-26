import { useState } from 'react';
import { Transaction } from '@/types/bank';
import Icon from '@/components/ui/icon';

interface HistoryPageProps {
  transactions: Transaction[];
}

const formatMoney = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(v);

export default function HistoryPage({ transactions }: HistoryPageProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = transactions.filter(t => {
    const matchSearch = t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.accountNumber.includes(search) || t.id.includes(search);
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchDate = !dateFilter || t.timestamp.startsWith(dateFilter);
    return matchSearch && matchType && matchDate;
  }).reverse();

  const getTypeStyle = (type: string) => {
    const map: Record<string, { icon: string; color: string; bg: string }> = {
      cash_out: { icon: 'ArrowUpFromLine', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
      cash_in: { icon: 'ArrowDownToLine', color: 'text-blue-400', bg: 'bg-blue-400/10' },
      credit: { icon: 'Landmark', color: 'text-purple-400', bg: 'bg-purple-400/10' },
      card_issue: { icon: 'CreditCard', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
      transfer: { icon: 'ArrowLeftRight', color: 'text-green-400', bg: 'bg-green-400/10' },
    };
    return map[type] || { icon: 'Circle', color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  const totalOut = transactions.filter(t => t.type === 'cash_out').reduce((s, t) => s + t.amount, 0);
  const totalIn = transactions.filter(t => t.type === 'cash_in').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
          <Icon name="History" size={20} className="text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">История операций</h1>
          <p className="font-mono text-xs text-muted-foreground">{transactions.length} операций</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Всего операций', value: transactions.length, color: 'text-foreground', icon: 'Activity' },
          { label: 'Выдано наличных', value: formatMoney(totalOut), color: 'text-yellow-400', icon: 'ArrowUpFromLine' },
          { label: 'Принято наличных', value: formatMoney(totalIn), color: 'text-blue-400', icon: 'ArrowDownToLine' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-4">
            <Icon name={s.icon} size={20} className={s.color} />
            <div>
              <p className="font-mono text-xs text-muted-foreground">{s.label}</p>
              <p className={`font-mono text-lg font-semibold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Клиент, счёт, ID операции..."
            className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-all font-mono text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-muted border border-border rounded-lg px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-all"
        >
          <option value="all">Все типы</option>
          <option value="cash_out">Выдача наличных</option>
          <option value="cash_in">Взнос наличных</option>
          <option value="credit">Кредиты</option>
          <option value="card_issue">Выпуск карт</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="bg-muted border border-border rounded-lg px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-all"
        />
        {(search || typeFilter !== 'all' || dateFilter) && (
          <button
            onClick={() => { setSearch(''); setTypeFilter('all'); setDateFilter(''); }}
            className="px-3 py-2 bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors font-mono text-xs"
          >
            Сброс
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['ID операции', 'Тип', 'Клиент', 'Счёт', 'Сумма', 'Дата/Время', 'Документ', 'Статус'].map(h => (
                <th key={h} className="text-left p-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(txn => {
              const style = getTypeStyle(txn.type);
              return (
                <tr key={txn.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs text-muted-foreground">{txn.id.slice(0, 12)}...</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md ${style.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={style.icon} size={11} className={style.color} />
                      </div>
                      <span className="text-xs text-foreground">{txn.typeLabel}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-foreground max-w-[150px] truncate">{txn.clientName}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground max-w-[120px] truncate">{txn.accountNumber}</td>
                  <td className="p-3">
                    <span className={`font-mono text-sm font-semibold ${
                      txn.type === 'cash_out' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {txn.type === 'cash_out' ? '-' : '+'}{formatMoney(txn.amount)}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {new Date(txn.timestamp).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 font-mono text-xs text-primary">
                    {txn.documentOKUD ? `ОКУД ${txn.documentOKUD}` : '—'}
                  </td>
                  <td className="p-3">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${
                      txn.status === 'success' ? 'bg-primary/10 text-primary border-primary/20' :
                      txn.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' :
                      'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {txn.status === 'success' ? 'Выполнено' : txn.status === 'pending' ? 'В обработке' : 'Отменено'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-muted-foreground font-mono text-xs">
                  Операции не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
