import { useState } from 'react';
import { Client, Account } from '@/types/bank';
import AccountCreateModal from '@/components/modals/AccountCreateModal';
import Icon from '@/components/ui/icon';

interface ClientsPageProps {
  clients: Client[];
  accounts: Account[];
  onClientAdded: (client: Client) => void;
  onAccountCreated: (account: Account) => void;
}

const formatMoney = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v);

export default function ClientsPage({ clients, accounts, onClientAdded, onAccountCreated }: ClientsPageProps) {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [form, setForm] = useState({ fullName: '', passport: '', phone: '', email: '', birthDate: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.passport.includes(search) ||
    c.phone.includes(search)
  );

  const getClientAccounts = (clientId: string) =>
    accounts.filter(a => a.clientId === clientId);

  const handleAddClient = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName) newErrors.fullName = 'Введите ФИО';
    if (!form.passport) newErrors.passport = 'Введите паспорт';
    if (!form.phone) newErrors.phone = 'Введите телефон';
    if (!form.birthDate) newErrors.birthDate = 'Введите дату рождения';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const client: Client = {
      id: `cli_${Date.now()}`,
      ...form,
      createdAt: new Date().toISOString().split('T')[0],
      accounts: [],
      cards: [],
    };
    onClientAdded(client);
    setShowAddForm(false);
    setForm({ fullName: '', passport: '', phone: '', email: '', birthDate: '', address: '' });
    setErrors({});
    setSelectedClient(client);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
            <Icon name="UserSquare" size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Клиентская база</h1>
            <p className="font-mono text-xs text-muted-foreground">{clients.length} клиентов</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg font-mono font-semibold text-sm transition-all"
        >
          <Icon name="UserPlus" size={15} />
          Добавить клиента
        </button>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* List */}
        <div className="col-span-2">
          <div className="relative mb-3">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по ФИО, паспорту, телефону..."
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-all font-mono text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto">
            {filtered.map(client => {
              const clientAccs = getClientAccounts(client.id);
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedClient?.id === client.id
                      ? 'bg-primary/10 border-primary/30'
                      : 'glass-card hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-mono text-xs font-bold text-primary">
                        {client.fullName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{client.fullName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{client.passport}</p>
                    </div>
                    <div className="ml-auto text-right flex-shrink-0">
                      <p className="font-mono text-xs text-muted-foreground">{clientAccs.length} сч.</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="UserX" size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-mono">Клиент не найден</p>
              </div>
            )}
          </div>
        </div>

        {/* Client detail */}
        <div className="col-span-3">
          {selectedClient ? (
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="font-mono text-sm font-bold text-primary">
                      {selectedClient.fullName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{selectedClient.fullName}</h2>
                    <p className="font-mono text-xs text-muted-foreground">ID: {selectedClient.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateAccount(true)}
                  className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-3 py-2 rounded-lg font-mono text-xs transition-all"
                >
                  <Icon name="Plus" size={13} /> Открыть счёт
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  { label: 'Паспорт', value: selectedClient.passport },
                  { label: 'Телефон', value: selectedClient.phone },
                  { label: 'Дата рождения', value: selectedClient.birthDate ? new Date(selectedClient.birthDate).toLocaleDateString('ru-RU') : '—' },
                  { label: 'Email', value: selectedClient.email || '—' },
                  { label: 'Адрес', value: selectedClient.address || '—', full: true },
                  { label: 'Клиент с', value: new Date(selectedClient.createdAt).toLocaleDateString('ru-RU') },
                ].map(row => (
                  <div key={row.label} className={row.full ? 'col-span-2' : ''}>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{row.label}</p>
                    <p className="text-sm text-foreground font-medium">{row.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <p className="font-semibold text-sm text-foreground">Счета</p>
                </div>
                {getClientAccounts(selectedClient.id).length === 0 ? (
                  <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
                    <Icon name="CreditCard" size={20} className="text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-mono">Счетов нет</p>
                    <button
                      onClick={() => setShowCreateAccount(true)}
                      className="mt-2 text-xs text-primary font-mono hover:underline"
                    >
                      Открыть первый счёт →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getClientAccounts(selectedClient.id).map(acc => (
                      <div key={acc.id} className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-xl">
                        <div>
                          <p className="font-mono text-xs text-foreground font-semibold">{acc.number}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{acc.typeLabel} · {acc.currency}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm font-semibold text-primary">{formatMoney(acc.balance)}</p>
                          <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                            acc.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                            {acc.status === 'active' ? 'Активен' : 'Заблокирован'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center h-full">
              <Icon name="UserSquare" size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-mono text-sm">Выберите клиента</p>
            </div>
          )}
        </div>
      </div>

      {/* Add client modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                  <Icon name="UserPlus" size={16} className="text-cyan-400" />
                </div>
                <h3 className="font-semibold text-foreground">Добавление клиента</h3>
              </div>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[
                { key: 'fullName', label: 'ФИО *', placeholder: 'Иванов Иван Иванович', full: true },
                { key: 'passport', label: 'Паспорт (серия номер) *', placeholder: '4521 345678' },
                { key: 'phone', label: 'Телефон *', placeholder: '+7 (900) 000-00-00' },
                { key: 'birthDate', label: 'Дата рождения *', placeholder: '', type: 'date' },
                { key: 'email', label: 'Email', placeholder: 'example@mail.ru' },
                { key: 'address', label: 'Адрес', placeholder: 'г. Москва, ул...', full: true },
              ].map(f => (
                <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                  <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                  />
                  {errors[f.key] && <p className="text-xs text-destructive font-mono mt-1">{errors[f.key]}</p>}
                </div>
              ))}
              <div className="col-span-2 mt-2">
                <button
                  onClick={handleAddClient}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-xl font-mono font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Icon name="UserPlus" size={15} />
                  ДОБАВИТЬ КЛИЕНТА
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateAccount && selectedClient && (
        <AccountCreateModal
          client={selectedClient}
          onCreated={(acc) => {
            onAccountCreated(acc);
            setShowCreateAccount(false);
          }}
          onClose={() => setShowCreateAccount(false)}
        />
      )}
    </div>
  );
}
