import { useState } from 'react';
import { Client, Account, Card, Employee } from '@/types/bank';
import AccountCreateModal from '@/components/modals/AccountCreateModal';
import Icon from '@/components/ui/icon';

interface CardsPageProps {
  clients: Client[];
  accounts: Account[];
  employee: Employee;
  onAccountCreated: (account: Account) => void;
}

const CARD_TYPES = [
  { value: 'debit', label: 'Дебетовая', icon: 'CreditCard', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
  { value: 'credit', label: 'Кредитная', icon: 'Landmark', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
];

function generateCardNumber(): string {
  const parts = Array.from({ length: 4 }, () =>
    String(Math.floor(1000 + Math.random() * 9000))
  );
  return parts.join(' ');
}

function generateExpiry(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear() + 4).slice(-2);
  return `${month}/${year}`;
}

function formatCardNumber(raw: string): string {
  return raw.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
}

export default function CardsPage({ clients, accounts, employee, onAccountCreated }: CardsPageProps) {
  const [issuedCards, setIssuedCards] = useState<Card[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [cardType, setCardType] = useState<'debit' | 'credit'>('debit');
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const [form, setForm] = useState({
    passport: '',
    fullName: '',
    phone: '',
    cardNumber: generateCardNumber(),
    expiryDate: generateExpiry(),
    accountId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doneCard, setDoneCard] = useState<Card | null>(null);

  const filtered = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.passport.includes(search) ||
    c.phone.includes(search)
  );

  const clientAccounts = selectedClient
    ? accounts.filter(a => a.clientId === selectedClient.id && a.status === 'active')
    : [];

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setForm(f => ({
      ...f,
      passport: client.passport,
      fullName: client.fullName,
      phone: client.phone,
      accountId: '',
    }));
  };

  const handleOpenForm = () => {
    setStep('form');
    setDoneCard(null);
    setErrors({});
    setForm(f => ({ ...f, cardNumber: generateCardNumber(), expiryDate: generateExpiry(), accountId: '' }));
    setShowForm(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.passport) newErrors.passport = 'Введите серию и номер паспорта';
    if (!form.fullName) newErrors.fullName = 'Введите ФИО';
    if (!form.phone) newErrors.phone = 'Введите номер телефона';
    if (!form.cardNumber || form.cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Введите 16-значный номер карты';
    if (!form.expiryDate) newErrors.expiryDate = 'Введите срок действия';
    if (!form.accountId) {
      newErrors.accountId = 'Выберите или создайте счёт для привязки карты';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleIssue = () => {
    if (!validate()) return;
    const linkedAccount = accounts.find(a => a.id === form.accountId);
    const card: Card = {
      id: `card_${Date.now()}`,
      clientId: selectedClient?.id || '',
      accountId: form.accountId,
      number: form.cardNumber,
      holderName: form.fullName.toUpperCase(),
      expiryDate: form.expiryDate,
      type: cardType,
      status: 'active',
      issuedAt: new Date().toISOString().split('T')[0],
    };
    setIssuedCards(prev => [...prev, card]);
    setDoneCard(card);
    setStep('done');
    void linkedAccount;
  };

  const cardColors: Record<string, string> = {
    debit: 'from-cyan-900/60 via-slate-800/80 to-slate-900/90',
    credit: 'from-purple-900/60 via-slate-800/80 to-slate-900/90',
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
            <Icon name="CreditCard" size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Выпуск карт</h1>
            <p className="font-mono text-xs text-muted-foreground">{issuedCards.length} карт выпущено в этой сессии</p>
          </div>
        </div>
        <button
          onClick={handleOpenForm}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2.5 rounded-lg font-mono text-sm transition-all"
        >
          <Icon name="Plus" size={15} />
          Выпустить карту
        </button>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Client list */}
        <div className="col-span-2">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Выберите клиента</p>
          <div className="relative mb-3">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ФИО, паспорт или телефон..."
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-all font-mono text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="space-y-1.5 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
            {filtered.map(client => {
              const cardCount = issuedCards.filter(c => c.clientId === client.id).length;
              return (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedClient?.id === client.id
                      ? 'bg-cyan-400/10 border-cyan-400/30'
                      : 'glass-card hover:border-cyan-400/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {client.fullName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{client.fullName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{client.passport}</p>
                    </div>
                    {cardCount > 0 && (
                      <span className="font-mono text-xs bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded-full flex-shrink-0">
                        {cardCount} карт
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="UserX" size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-mono">Клиент не найден</p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="col-span-3 space-y-5">
          {selectedClient ? (
            <>
              {/* Card visual preview */}
              <div className={`relative rounded-2xl p-6 bg-gradient-to-br ${cardColors[cardType]} border border-white/10 overflow-hidden`}>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }}
                />
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-xs text-white/50 uppercase tracking-widest">АС ЕФС СБОЛ.про</p>
                      <p className="font-mono text-xs text-white/70 mt-0.5">{cardType === 'debit' ? 'ДЕБЕТОВАЯ' : 'КРЕДИТНАЯ'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <Icon name="CreditCard" size={18} className="text-white/70" />
                    </div>
                  </div>
                  <p className="font-mono text-xl font-bold text-white tracking-widest">
                    {form.cardNumber || '0000 0000 0000 0000'}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-mono text-xs text-white/40 uppercase">Держатель</p>
                      <p className="font-mono text-sm text-white font-semibold mt-0.5">
                        {form.fullName ? form.fullName.toUpperCase() : selectedClient.fullName.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-white/40 uppercase">Срок</p>
                      <p className="font-mono text-sm text-white font-semibold mt-0.5">{form.expiryDate || 'MM/YY'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accounts */}
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Счёт для привязки карты</p>
                  <button
                    onClick={() => setShowCreateAccount(true)}
                    className="flex items-center gap-1 text-xs text-primary font-mono hover:text-primary/70 transition-colors"
                  >
                    <Icon name="Plus" size={12} /> Новый счёт
                  </button>
                </div>
                {clientAccounts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground font-mono mb-2">У клиента нет активных счетов</p>
                    <button
                      onClick={() => setShowCreateAccount(true)}
                      className="text-xs text-primary font-mono hover:underline"
                    >
                      Открыть счёт →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {clientAccounts.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => setForm(f => ({ ...f, accountId: acc.id }))}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          form.accountId === acc.id
                            ? 'bg-cyan-400/10 border-cyan-400/30'
                            : 'bg-muted/50 border-border hover:border-cyan-400/20'
                        }`}
                      >
                        <p className="font-mono text-xs text-foreground">{acc.number.slice(-8)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{acc.typeLabel}</p>
                      </button>
                    ))}
                  </div>
                )}
                {errors.accountId && <p className="text-xs text-destructive font-mono mt-2">{errors.accountId}</p>}
              </div>

              <button
                onClick={handleOpenForm}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-mono text-sm"
              >
                <Icon name="CreditCard" size={16} />
                ВЫПУСТИТЬ КАРТУ ДЛЯ {selectedClient.fullName.split(' ')[1]}
              </button>
            </>
          ) : (
            <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-4">
                <Icon name="CreditCard" size={28} className="text-cyan-400/50" />
              </div>
              <p className="text-muted-foreground font-mono text-sm">Выберите клиента слева</p>
              <p className="text-muted-foreground/50 font-mono text-xs mt-1">Для выпуска новой карты</p>
            </div>
          )}

          {/* Issued cards in session */}
          {issuedCards.length > 0 && (
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-cyan-400 rounded-full" />
                <p className="font-semibold text-sm text-foreground">Выпущено в этой сессии</p>
              </div>
              <div className="space-y-2">
                {issuedCards.slice().reverse().map(card => {
                  const client = clients.find(c => c.id === card.clientId);
                  return (
                    <div key={card.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        card.type === 'debit' ? 'bg-cyan-400/10' : 'bg-purple-400/10'
                      }`}>
                        <Icon name="CreditCard" size={14} className={card.type === 'debit' ? 'text-cyan-400' : 'text-purple-400'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{client?.fullName || card.holderName}</p>
                        <p className="font-mono text-xs text-muted-foreground">{card.number} · {card.expiryDate}</p>
                      </div>
                      <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${
                        card.type === 'debit' ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20' : 'bg-purple-400/10 text-purple-400 border-purple-400/20'
                      }`}>
                        {card.type === 'debit' ? 'Дебет' : 'Кредит'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Issue modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                  <Icon name="CreditCard" size={16} className="text-cyan-400" />
                </div>
                <h3 className="font-semibold text-foreground">Выпуск банковской карты</h3>
              </div>
              {step === 'form' && (
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="X" size={18} />
                </button>
              )}
            </div>

            {step === 'form' ? (
              <div className="p-5 space-y-4">
                {/* Type selector */}
                <div>
                  <label className="block font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">Тип карты</label>
                  <div className="flex gap-2">
                    {CARD_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setCardType(t.value as 'debit' | 'credit')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-mono text-sm font-semibold transition-all ${
                          cardType === t.value ? `${t.bg} ${t.color}` : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon name={t.icon} size={15} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'passport', label: 'Паспорт (серия и номер) *', placeholder: '4521 345678' },
                    { key: 'fullName', label: 'ФИО клиента *', placeholder: 'Иванов Иван Иванович' },
                    { key: 'phone', label: 'Номер телефона *', placeholder: '+7 (900) 000-00-00' },
                    { key: 'cardNumber', label: 'Номер карты *', placeholder: '0000 0000 0000 0000' },
                    { key: 'expiryDate', label: 'Срок действия *', placeholder: 'MM/YY' },
                  ].map(f => (
                    <div key={f.key} className={f.key === 'fullName' ? 'col-span-2' : ''}>
                      <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">{f.label}</label>
                      <input
                        value={(form as Record<string, string>)[f.key]}
                        onChange={e => {
                          let val = e.target.value;
                          if (f.key === 'cardNumber') val = formatCardNumber(val);
                          setForm(prev => ({ ...prev, [f.key]: val }));
                        }}
                        placeholder={f.placeholder}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-cyan-400 transition-all text-foreground placeholder:text-muted-foreground/50"
                      />
                      {errors[f.key] && <p className="text-xs text-destructive font-mono mt-1">{errors[f.key]}</p>}
                    </div>
                  ))}

                  {/* Account */}
                  <div className="col-span-2">
                    <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Счёт для привязки *</label>
                    {clientAccounts.length > 0 ? (
                      <div className="flex gap-2 flex-wrap mb-2">
                        {clientAccounts.map(acc => (
                          <button
                            key={acc.id}
                            onClick={() => setForm(f => ({ ...f, accountId: acc.id }))}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${
                              form.accountId === acc.id
                                ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400'
                                : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            ...{acc.number.slice(-6)} · {acc.typeLabel}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground font-mono mb-1">У клиента нет счетов.</p>
                        <button
                          onClick={() => { setShowForm(false); setShowCreateAccount(true); }}
                          className="text-xs text-primary font-mono hover:underline flex items-center gap-1"
                        >
                          <Icon name="Plus" size={12} /> Создать счёт и вернуться к выпуску карты
                        </button>
                      </div>
                    )}
                    {errors.accountId && <p className="text-xs text-destructive font-mono">{errors.accountId}</p>}
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 bg-muted border border-border rounded-xl font-mono text-sm text-muted-foreground hover:text-foreground transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleIssue}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 rounded-xl font-mono text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Icon name="CreditCard" size={15} />
                    ВЫПУСТИТЬ КАРТУ
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-5">
                {/* Success card visual */}
                <div className={`relative rounded-2xl p-6 bg-gradient-to-br ${cardColors[doneCard?.type || 'debit']} border border-white/10 overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }}
                  />
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex justify-between">
                      <p className="font-mono text-xs text-white/50 uppercase">АС ЕФС СБОЛ.про</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-primary/80" />
                        <div className="w-3 h-3 rounded-full bg-primary/50 -ml-1.5" />
                      </div>
                    </div>
                    <p className="font-mono text-lg font-bold text-white tracking-widest">{doneCard?.number}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="font-mono text-xs text-white/40">Держатель</p>
                        <p className="font-mono text-sm text-white font-semibold">{doneCard?.holderName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs text-white/40">До</p>
                        <p className="font-mono text-sm text-white">{doneCard?.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle" size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Карта успешно выпущена!</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {doneCard?.type === 'debit' ? 'Дебетовая' : 'Кредитная'} · Выдана {new Date().toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                <div className="bg-muted rounded-xl p-4 space-y-2">
                  {[
                    { label: 'Оператор', value: employee.name },
                    { label: 'Время выдачи', value: new Date().toLocaleTimeString('ru-RU') },
                    { label: 'ID карты', value: doneCard?.id || '' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between">
                      <span className="font-mono text-xs text-muted-foreground">{r.label}</span>
                      <span className="font-mono text-xs text-foreground">{r.value}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setShowForm(false); setStep('form'); }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-xl font-mono font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Icon name="Plus" size={15} />
                  Выпустить ещё карту
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateAccount && selectedClient && (
        <AccountCreateModal
          client={selectedClient}
          onCreated={(acc) => {
            onAccountCreated(acc);
            setForm(f => ({ ...f, accountId: acc.id }));
            setShowCreateAccount(false);
            setShowForm(true);
          }}
          onClose={() => setShowCreateAccount(false)}
          returnLabel="← Вернуться к выпуску карты"
        />
      )}
    </div>
  );
}
