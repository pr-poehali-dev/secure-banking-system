import { useState } from 'react';
import { Account, Client } from '@/types/bank';
import AccountCreateModal from '@/components/modals/AccountCreateModal';
import Icon from '@/components/ui/icon';

interface AccountsPageProps {
  accounts: Account[];
  clients: Client[];
  onAccountCreated: (account: Account) => void;
}

const formatMoney = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v);

export default function AccountsPage({ accounts, clients, onAccountCreated }: AccountsPageProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const filtered = accounts.filter(a => {
    const client = clients.find(c => c.id === a.clientId);
    const matchSearch = a.number.includes(search) || client?.fullName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const totalBalance = accounts.filter(a => a.status === 'active').reduce((s, a) => s + a.balance, 0);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center">
            <Icon name="CreditCard" size={20} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Учёт счетов</h1>
            <p className="font-mono text-xs text-muted-foreground">{accounts.length} счетов · {formatMoney(totalBalance)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted border border-border rounded-lg p-1">
            {(['all', 'active', 'blocked'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md font-mono text-xs transition-all ${
                  filter === f ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'all' ? 'Все' : f === 'active' ? 'Активные' : 'Заблок.'}
              </button>
            ))}
          </div>
          <div>
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="bg-muted border border-border rounded-lg px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-all"
            >
              <option value="">Выбрать клиента...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
          </div>
          {selectedClient && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-mono font-semibold text-sm transition-all"
            >
              <Icon name="Plus" size={14} />
              Открыть счёт
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Всего счетов', value: accounts.length, color: 'text-foreground' },
          { label: 'Активных', value: accounts.filter(a => a.status === 'active').length, color: 'text-primary' },
          { label: 'Заблокированных', value: accounts.filter(a => a.status === 'blocked').length, color: 'text-destructive' },
          { label: 'Общий баланс', value: formatMoney(totalBalance), color: 'text-orange-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-xl font-semibold font-mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по номеру счёта или имени клиента..."
          className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-all font-mono text-foreground placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 font-mono text-xs text-muted-foreground uppercase tracking-wider">Номер счёта</th>
              <th className="text-left p-4 font-mono text-xs text-muted-foreground uppercase tracking-wider">Клиент</th>
              <th className="text-left p-4 font-mono text-xs text-muted-foreground uppercase tracking-wider">Тип</th>
              <th className="text-right p-4 font-mono text-xs text-muted-foreground uppercase tracking-wider">Баланс</th>
              <th className="text-center p-4 font-mono text-xs text-muted-foreground uppercase tracking-wider">Статус</th>
              <th className="text-left p-4 font-mono text-xs text-muted-foreground uppercase tracking-wider">Открыт</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((acc, i) => {
              const client = clients.find(c => c.id === acc.clientId);
              return (
                <tr key={acc.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="p-4 font-mono text-xs text-foreground">{acc.number}</td>
                  <td className="p-4 text-sm text-foreground">{client?.fullName || '—'}</td>
                  <td className="p-4 text-xs text-muted-foreground">{acc.typeLabel}</td>
                  <td className="p-4 text-right font-mono text-sm font-semibold text-primary">{formatMoney(acc.balance)}</td>
                  <td className="p-4 text-center">
                    <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                      acc.status === 'active' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                      {acc.status === 'active' ? 'Активен' : 'Заблокирован'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">
                    {new Date(acc.openedAt).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground font-mono text-xs">
                  Счета не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && selectedClient && (
        <AccountCreateModal
          client={selectedClient}
          onCreated={(acc) => {
            onAccountCreated(acc);
            setShowCreate(false);
          }}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
