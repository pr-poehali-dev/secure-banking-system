import { useState } from 'react';
import { Client, Account, Credit, Transaction, Employee } from '@/types/bank';
import { INITIAL_CREDITS } from '@/data/mockData';
import AccountCreateModal from '@/components/modals/AccountCreateModal';
import Icon from '@/components/ui/icon';

interface CreditsPageProps {
  clients: Client[];
  accounts: Account[];
  employee: Employee;
  onTransaction: (txn: Transaction) => void;
  onAccountCreated: (account: Account) => void;
}

const formatMoney = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v);

export default function CreditsPage({ clients, accounts, employee, onTransaction, onAccountCreated }: CreditsPageProps) {
  const [credits, setCredits] = useState<Credit[]>(INITIAL_CREDITS);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'credit' | 'installment'>('credit');
  const [form, setForm] = useState({ passport: '', fullName: '', accountOrCard: '', amount: '', term: '', rate: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Credit | null>(null);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [matchedClient, setMatchedClient] = useState<Client | null>(null);

  const handlePassportBlur = () => {
    const found = clients.find(c => c.passport === form.passport);
    if (found) {
      setMatchedClient(found);
      setForm(f => ({ ...f, fullName: found.fullName }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.passport) newErrors.passport = 'Введите паспорт';
    if (!form.fullName) newErrors.fullName = 'Введите ФИО';
    if (!form.accountOrCard) newErrors.accountOrCard = 'Введите счёт или карту';
    else if (!accounts.find(a => a.number === form.accountOrCard)) {
      newErrors.accountOrCard = 'Счёт не найден. Создайте счёт для зачисления.';
    }
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Введите сумму';
    if (!form.term || parseInt(form.term) <= 0) newErrors.term = 'Введите срок';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const amt = parseFloat(form.amount);
    const term = parseInt(form.term);
    const rate = type === 'credit' ? 18.5 : 0;
    const monthly = type === 'credit'
      ? Math.round(amt * (rate / 100 / 12) / (1 - Math.pow(1 + rate / 100 / 12, -term)))
      : Math.round(amt / term);

    const credit: Credit = {
      id: `crd_${Date.now()}`,
      clientId: matchedClient?.id || '',
      clientName: form.fullName,
      passport: form.passport,
      accountNumber: form.accountOrCard,
      amount: amt,
      term,
      rate,
      monthlyPayment: monthly,
      type,
      status: 'active',
      issuedAt: new Date().toISOString().split('T')[0],
    };
    setCredits(prev => [...prev, credit]);

    const txn: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'credit',
      typeLabel: type === 'credit' ? 'Выдача кредита' : 'Выдача рассрочки',
      clientId: matchedClient?.id || '',
      clientName: form.fullName,
      accountNumber: form.accountOrCard,
      amount: amt,
      currency: 'RUB',
      operatorId: employee.id,
      operatorName: employee.name,
      timestamp: new Date().toISOString(),
      status: 'success',
    };
    onTransaction(txn);
    setDone(credit);
    setShowForm(false);
  };

  const accountForCredit = accounts.find(a => a.number === form.accountOrCard);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
            <Icon name="Landmark" size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Кредит / Рассрочка</h1>
            <p className="font-mono text-xs text-muted-foreground">{credits.length} активных договоров</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setDone(null); setForm({ passport: '', fullName: '', accountOrCard: '', amount: '', term: '', rate: '' }); setErrors({}); }}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white px-4 py-2.5 rounded-lg font-mono font-semibold text-sm transition-all"
        >
          <Icon name="Plus" size={15} />
          Новый договор
        </button>
      </div>

      {done && (
        <div className="glass-card rounded-xl p-5 mb-5 border-purple-400/25 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-400/15 border border-purple-400/30 flex items-center justify-center">
              <Icon name="CheckCircle" size=  {20} className="text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Договор оформлен</p>
              <p className="font-mono text-xs text-muted-foreground">{done.type === 'credit' ? 'Кредит' : 'Рассрочка'}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Клиент', value: done.clientName },
              { label: 'Сумма', value: formatMoney(done.amount) },
              { label: 'Срок', value: `${done.term} мес.` },
              { label: 'Ежемесячный платёж', value: formatMoney(done.monthlyPayment) },
            ].map(r => (
              <div key={r.label} className="bg-muted/50 rounded-lg p-3">
                <p className="font-mono text-xs text-muted-foreground">{r.label}</p>
                <p className="font-semibold text-sm text-foreground mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credits table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Клиент', 'Тип', 'Сумма', 'Срок', 'Ставка', 'Платёж/мес', 'Счёт', 'Статус'].map(h => (
                <th key={h} className="text-left p-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {credits.map(credit => (
              <tr key={credit.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <p className="text-sm font-medium text-foreground">{credit.clientName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{credit.passport}</p>
                </td>
                <td className="p-3">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${
                    credit.type === 'credit' ? 'bg-purple-400/10 text-purple-400 border-purple-400/20' : 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20'
                  }`}>
                    {credit.type === 'credit' ? 'Кредит' : 'Рассрочка'}
                  </span>
                </td>
                <td className="p-3 font-mono text-sm font-semibold text-foreground">{formatMoney(credit.amount)}</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{credit.term} мес.</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{credit.rate > 0 ? `${credit.rate}%` : '0%'}</td>
                <td className="p-3 font-mono text-sm text-purple-400 font-semibold">{formatMoney(credit.monthlyPayment)}</td>
                <td className="p-3 font-mono text-xs text-muted-foreground max-w-[130px] truncate">{credit.accountNumber}</td>
                <td className="p-3">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${
                    credit.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' :
                    credit.status === 'overdue' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    {credit.status === 'active' ? 'Активен' : credit.status === 'overdue' ? 'Просрочен' : 'Закрыт'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New credit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
                  <Icon name="Landmark" size={16} className="text-purple-400" />
                </div>
                <h3 className="font-semibold text-foreground">Оформление договора</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Type */}
              <div className="flex gap-2">
                {(['credit', 'installment'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-2.5 rounded-xl font-mono text-sm font-semibold border transition-all ${
                      type === t ? 'bg-purple-400/15 border-purple-400/40 text-purple-400' : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t === 'credit' ? '💳 Кредит' : '📅 Рассрочка'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'passport', label: 'Паспорт *', placeholder: '4521 345678', onBlur: handlePassportBlur },
                  { key: 'fullName', label: 'ФИО клиента *', placeholder: 'Автозаполнение по паспорту' },
                  { key: 'amount', label: `Сумма ${type === 'credit' ? 'кредита' : 'рассрочки'} (₽) *`, placeholder: '100000' },
                  { key: 'term', label: 'Срок (месяцев) *', placeholder: '12' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">{f.label}</label>
                    <input
                      value={(form as Record<string, string>)[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      onBlur={f.onBlur}
                      placeholder={f.placeholder}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                    />
                    {errors[f.key] && <p className="text-xs text-destructive font-mono mt-1">{errors[f.key]}</p>}
                  </div>
                ))}

                <div className="col-span-2">
                  <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Счёт / карта зачисления *</label>
                  {matchedClient && accounts.filter(a => a.clientId === matchedClient.id).length > 0 && (
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {accounts.filter(a => a.clientId === matchedClient.id).map(acc => (
                        <button
                          key={acc.id}
                          onClick={() => setForm(f => ({ ...f, accountOrCard: acc.number }))}
                          className={`text-xs px-2 py-1 rounded border font-mono transition-all ${
                            form.accountOrCard === acc.number ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {acc.number.slice(-8)}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    value={form.accountOrCard}
                    onChange={e => setForm(f => ({ ...f, accountOrCard: e.target.value }))}
                    placeholder="40817810000000000000"
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                  />
                  {errors.accountOrCard && (
                    <div>
                      <p className="text-xs text-destructive font-mono mt-1">{errors.accountOrCard}</p>
                      {errors.accountOrCard.includes('не найден') && (
                        <button
                          onClick={() => setShowCreateAccount(true)}
                          className="text-xs text-primary font-mono mt-1 hover:underline flex items-center gap-1"
                        >
                          <Icon name="Plus" size={12} /> Создать счёт
                        </button>
                      )}
                    </div>
                  )}
                  {accountForCredit && (
                    <p className="font-mono text-xs text-primary mt-1">✓ {accountForCredit.typeLabel}</p>
                  )}
                </div>
              </div>

              {form.amount && form.term && (
                <div className="bg-purple-400/5 border border-purple-400/15 rounded-xl p-3">
                  <p className="font-mono text-xs text-muted-foreground mb-1">Расчёт платежа</p>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Ставка</span>
                    <span className="font-mono text-xs text-foreground">{type === 'credit' ? '18.5% годовых' : '0%'}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Ежемесячный платёж ~</span>
                    <span className="font-mono text-sm font-semibold text-purple-400">
                      {formatMoney(
                        type === 'credit'
                          ? Math.round(parseFloat(form.amount || '0') * (18.5 / 100 / 12) / (1 - Math.pow(1 + 18.5 / 100 / 12, -(parseInt(form.term || '1')))))
                          : Math.round(parseFloat(form.amount || '0') / parseInt(form.term || '1'))
                      )}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="w-full bg-purple-500 hover:bg-purple-400 text-white py-3 rounded-xl font-mono font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Icon name="CheckCircle" size={15} />
                ОФОРМИТЬ ДОГОВОР
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateAccount && matchedClient && (
        <AccountCreateModal
          client={matchedClient}
          onCreated={(acc) => {
            onAccountCreated(acc);
            setForm(f => ({ ...f, accountOrCard: acc.number }));
            setShowCreateAccount(false);
          }}
          onClose={() => setShowCreateAccount(false)}
          returnLabel="← Вернуться к договору"
        />
      )}
    </div>
  );
}
