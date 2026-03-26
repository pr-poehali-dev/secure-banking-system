import { useState } from 'react';
import { QueueItem, Client, Account, Transaction, Employee, OperationType } from '@/types/bank';
import { OPERATION_LABELS } from '@/data/mockData';
import AccountCreateModal from '@/components/modals/AccountCreateModal';
import Icon from '@/components/ui/icon';

interface QueuePageProps {
  queue: QueueItem[];
  clients: Client[];
  accounts: Account[];
  employee: Employee;
  onQueueUpdate: (queue: QueueItem[]) => void;
  onTransaction: (txn: Transaction) => void;
  onAccountCreated: (account: Account) => void;
}

const formatMoney = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(v);

type ModalType = 'cash_out' | 'cash_in' | 'card_issue' | 'credit' | 'account_open' | null;

export default function QueuePage({ queue, clients, accounts, employee, onQueueUpdate, onTransaction, onAccountCreated }: QueuePageProps) {
  const [activeTicket, setActiveTicket] = useState<QueueItem | null>(null);
  const [selectedOp, setSelectedOp] = useState<ModalType>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [opDone, setOpDone] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const waiting = queue.filter(q => q.status === 'waiting');

  const callNext = () => {
    if (waiting.length === 0) return;
    const next = waiting[0];
    const updated = queue.map(q =>
      q.id === next.id ? { ...q, status: 'serving' as const, calledAt: new Date().toISOString(), windowNumber: 1 } : q
    );
    onQueueUpdate(updated);
    setActiveTicket({ ...next, status: 'serving', calledAt: new Date().toISOString(), windowNumber: 1 });
    setSelectedOp(null);
    setOpDone(false);
    setForm({});
    setErrors({});
  };

  const addToQueue = () => {
    const ops: OperationType[] = ['cash_in'];
    const ticket: QueueItem = {
      id: `q_${Date.now()}`,
      ticketNumber: `О-${String(queue.length + 1).padStart(3, '0')}`,
      clientName: 'Новый клиент',
      operations: ops,
      status: 'waiting',
      arrivedAt: new Date().toISOString(),
    };
    onQueueUpdate([...queue, ticket]);
  };

  const finishServing = () => {
    if (!activeTicket) return;
    const updated = queue.map(q =>
      q.id === activeTicket.id ? { ...q, status: 'done' as const, doneAt: new Date().toISOString() } : q
    );
    onQueueUpdate(updated);
    setActiveTicket(null);
    setSelectedOp(null);
    setOpDone(false);
    setForm({});
  };

  const getOpIcon = (op: string) => {
    const map: Record<string, string> = {
      cash_out: 'ArrowUpFromLine', cash_in: 'ArrowDownToLine',
      credit: 'Landmark', installment: 'CalendarClock',
      card_issue: 'CreditCard', account_open: 'FolderPlus',
      transfer: 'ArrowLeftRight', other: 'MoreHorizontal',
    };
    return map[op] || 'Circle';
  };

  const getOpColor = (op: string) => {
    const map: Record<string, string> = {
      cash_out: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      cash_in: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      credit: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      installment: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
      card_issue: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
      account_open: 'text-primary bg-primary/10 border-primary/20',
    };
    return map[op] || 'text-muted-foreground bg-muted border-border';
  };

  const clientForTicket = activeTicket?.clientId
    ? clients.find(c => c.id === activeTicket.clientId)
    : null;

  const clientAccounts = clientForTicket
    ? accounts.filter(a => a.clientId === clientForTicket.id && a.status === 'active')
    : [];

  const validateAndExecute = () => {
    const newErrors: Record<string, string> = {};
    if (selectedOp === 'cash_out' || selectedOp === 'cash_in') {
      if (!form.accountNumber) newErrors.accountNumber = 'Введите номер счёта';
      else if (!accounts.find(a => a.number === form.accountNumber)) {
        newErrors.accountNumber = 'Счёт не найден. Создайте новый счёт.';
      }
      if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Введите корректную сумму';
    }
    if (selectedOp === 'card_issue') {
      if (!form.passport) newErrors.passport = 'Введите паспорт';
      if (!form.fullName) newErrors.fullName = 'Введите ФИО';
      if (!form.phone) newErrors.phone = 'Введите телефон';
      if (!form.cardNumber) newErrors.cardNumber = 'Введите номер карты';
      if (!form.expiryDate) newErrors.expiryDate = 'Введите срок действия';
    }
    if (selectedOp === 'credit') {
      if (!form.passport) newErrors.passport = 'Введите паспорт';
      if (!form.fullName) newErrors.fullName = 'Введите ФИО';
      if (!form.accountOrCard) newErrors.accountOrCard = 'Введите счёт или карту';
      if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Введите сумму кредита';
      if (!form.term) newErrors.term = 'Введите срок оплаты';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if ((selectedOp === 'cash_out' || selectedOp === 'cash_in') && activeTicket) {
      const txn: Transaction = {
        id: `txn_${Date.now()}`,
        type: selectedOp,
        typeLabel: selectedOp === 'cash_out' ? 'Выдача наличных' : 'Взнос наличных',
        clientId: activeTicket.clientId || '',
        clientName: activeTicket.clientName,
        accountNumber: form.accountNumber,
        amount: parseFloat(form.amount),
        currency: 'RUB',
        operatorId: employee.id,
        operatorName: employee.name,
        timestamp: new Date().toISOString(),
        status: 'success',
        documentOKUD: selectedOp === 'cash_out' ? '0402009' : '0402008',
      };
      onTransaction(txn);
    }
    setOpDone(true);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Icon name="Users" size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Электронная очередь</h1>
            <p className="font-mono text-xs text-muted-foreground">
              Ожидают: <span className="text-primary">{waiting.length}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={addToQueue}
            className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg text-sm hover:border-primary/40 transition-all font-mono"
          >
            <Icon name="Plus" size={14} />
            Добавить в очередь
          </button>
          <button
            onClick={callNext}
            disabled={waiting.length === 0 || !!activeTicket}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold font-mono text-sm disabled:opacity-50 transition-all"
          >
            <Icon name="UserCheck" size={16} />
            Взять следующего
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Queue list */}
        <div className="col-span-1 space-y-3">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">В очереди</p>
          {waiting.length === 0 && (
            <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
              <Icon name="CheckCircle" size={28} className="text-primary mx-auto mb-2" />
              <p className="text-xs font-mono">Очередь пуста</p>
            </div>
          )}
          {queue.map((item) => (
            <div
              key={item.id}
              className={`glass-card rounded-xl p-4 transition-all ${
                item.status === 'serving' ? 'border-primary/40 bg-primary/5' :
                item.status === 'done' ? 'opacity-40' :
                'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-mono text-sm font-bold ${
                  item.status === 'serving' ? 'text-primary' : 'text-muted-foreground'
                }`}>{item.ticketNumber}</span>
                <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${
                  item.status === 'waiting' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' :
                  item.status === 'serving' ? 'bg-primary/10 text-primary border-primary/20' :
                  'bg-muted text-muted-foreground border-border'
                }`}>
                  {item.status === 'waiting' ? 'Ожидает' : item.status === 'serving' ? 'Обслуживается' : 'Готово'}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground truncate">{item.clientName}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {item.operations.slice(0, 3).map(op => (
                  <span key={op} className="font-mono text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                    {OPERATION_LABELS[op]}
                  </span>
                ))}
              </div>
              <p className="font-mono text-xs text-muted-foreground mt-2">
                {Math.floor((Date.now() - new Date(item.arrivedAt).getTime()) / 60000)} мин назад
              </p>
            </div>
          ))}
        </div>

        {/* Active serving */}
        <div className="col-span-2">
          {activeTicket ? (
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <span className="font-mono text-sm font-bold text-primary">{activeTicket.ticketNumber}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{activeTicket.clientName}</p>
                    {clientForTicket && (
                      <p className="font-mono text-xs text-muted-foreground">{clientForTicket.passport}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={finishServing}
                  className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/25 rounded-lg font-mono text-xs transition-all"
                >
                  Завершить обслуживание
                </button>
              </div>

              {!selectedOp && !opDone && (
                <>
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">Запрошенные операции</p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {activeTicket.operations.map(op => {
                      const colors = getOpColor(op).split(' ');
                      return (
                        <button
                          key={op}
                          onClick={() => setSelectedOp(op as ModalType)}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 hover:scale-105 transition-all ${getOpColor(op)}`}
                        >
                          <Icon name={getOpIcon(op)} size={22} className={colors[0]} />
                          <span className="text-xs font-medium text-foreground text-center">{OPERATION_LABELS[op]}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">Дополнительные операции</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(['cash_out', 'cash_in', 'card_issue', 'credit'] as ModalType[])
                      .filter(op => !activeTicket.operations.includes(op as OperationType))
                      .map(op => op && (
                        <button
                          key={op}
                          onClick={() => setSelectedOp(op)}
                          className="p-3 rounded-xl bg-muted border border-border hover:border-primary/30 flex flex-col items-center gap-1.5 transition-all group"
                        >
                          <Icon name={getOpIcon(op)} size={18} className="text-muted-foreground group-hover:text-primary" />
                          <span className="text-xs text-muted-foreground group-hover:text-foreground text-center font-mono">{OPERATION_LABELS[op]}</span>
                        </button>
                      ))}
                  </div>
                </>
              )}

              {/* Operation form */}
              {selectedOp && !opDone && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => { setSelectedOp(null); setForm({}); setErrors({}); }} className="text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="ArrowLeft" size={16} />
                    </button>
                    <div className="w-6 h-6 rounded-md flex items-center justify-center border" style={{ background: 'transparent' }}>
                      <Icon name={getOpIcon(selectedOp)} size={14} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{OPERATION_LABELS[selectedOp]}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {(selectedOp === 'cash_out' || selectedOp === 'cash_in') && (
                      <>
                        <div>
                          <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Номер счёта *</label>
                          {clientAccounts.length > 0 && (
                            <div className="space-y-1 mb-2">
                              {clientAccounts.map(acc => (
                                <button
                                  key={acc.id}
                                  onClick={() => setForm(f => ({ ...f, accountNumber: acc.number }))}
                                  className={`w-full text-left p-2 rounded border text-xs transition-all ${
                                    form.accountNumber === acc.number ? 'bg-primary/10 border-primary/30' : 'bg-muted border-border hover:border-primary/20'
                                  }`}
                                >
                                  <span className="font-mono text-foreground">{acc.number}</span>
                                  <span className="ml-2 text-primary font-mono">{formatMoney(acc.balance)}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          <input
                            value={form.accountNumber || ''}
                            onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))}
                            placeholder="40817810000000000000"
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                          />
                          {errors.accountNumber && (
                            <p className="text-xs text-destructive font-mono mt-1">{errors.accountNumber}</p>
                          )}
                          {errors.accountNumber?.includes('не найден') && (
                            <button
                              onClick={() => setShowCreateAccount(true)}
                              className="text-xs text-primary font-mono mt-1 hover:underline flex items-center gap-1"
                            >
                              <Icon name="Plus" size={12} /> Создать счёт
                            </button>
                          )}
                        </div>
                        <div>
                          <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">
                            Сумма (₽) *
                          </label>
                          <input
                            value={form.amount || ''}
                            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                            placeholder="0.00"
                            type="number"
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 font-mono text-lg focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                          />
                          {errors.amount && <p className="text-xs text-destructive font-mono mt-1">{errors.amount}</p>}
                        </div>
                      </>
                    )}

                    {selectedOp === 'card_issue' && (
                      <>
                        {[
                          { key: 'passport', label: 'Паспорт (серия и номер)', placeholder: '4521 345678' },
                          { key: 'fullName', label: 'ФИО клиента', placeholder: 'Иванов Иван Иванович' },
                          { key: 'phone', label: 'Номер телефона', placeholder: '+7 (900) 000-00-00' },
                          { key: 'cardNumber', label: 'Номер карты', placeholder: '4276 0000 0000 0000' },
                          { key: 'expiryDate', label: 'Срок действия', placeholder: '12/28' },
                        ].map(field => (
                          <div key={field.key}>
                            <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">{field.label} *</label>
                            <input
                              value={form[field.key] || ''}
                              onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                              placeholder={field.placeholder}
                              className="w-full bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                            />
                            {errors[field.key] && <p className="text-xs text-destructive font-mono mt-1">{errors[field.key]}</p>}
                          </div>
                        ))}
                      </>
                    )}

                    {selectedOp === 'credit' && (
                      <>
                        {[
                          { key: 'passport', label: 'Паспорт', placeholder: '4521 345678' },
                          { key: 'fullName', label: 'ФИО клиента', placeholder: 'Иванов Иван Иванович' },
                          { key: 'accountOrCard', label: 'Счёт / карта зачисления', placeholder: '40817810000000000000' },
                          { key: 'amount', label: 'Сумма кредита (₽)', placeholder: '100000' },
                          { key: 'term', label: 'Срок оплаты (мес)', placeholder: '12' },
                        ].map(field => (
                          <div key={field.key}>
                            <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">{field.label} *</label>
                            <input
                              value={form[field.key] || ''}
                              onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                              placeholder={field.placeholder}
                              className="w-full bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                            />
                            {errors[field.key] && <p className="text-xs text-destructive font-mono mt-1">{errors[field.key]}</p>}
                          </div>
                        ))}
                      </>
                    )}

                    {selectedOp === 'account_open' && clientForTicket && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground font-mono mb-3">Открытие нового счёта для клиента</p>
                        <button
                          onClick={() => setShowCreateAccount(true)}
                          className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-4 py-2.5 rounded-lg font-mono text-sm transition-all"
                        >
                          <Icon name="Plus" size={15} /> Открыть счёт
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedOp !== 'account_open' && (
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={validateAndExecute}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-xl font-mono font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                      >
                        <Icon name="CheckCircle" size={15} />
                        ВЫПОЛНИТЬ ОПЕРАЦИЮ
                      </button>
                    </div>
                  )}
                </div>
              )}

              {opDone && (
                <div className="animate-fade-in text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center mx-auto mb-3">
                    <Icon name="CheckCircle" size={28} className="text-primary" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">Операция выполнена!</p>
                  <p className="text-muted-foreground text-xs font-mono mb-4">{OPERATION_LABELS[selectedOp!]}</p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => { setSelectedOp(null); setForm({}); setOpDone(false); setErrors({}); }}
                      className="px-5 py-2 bg-muted hover:bg-secondary border border-border rounded-lg font-mono text-sm transition-all"
                    >
                      Следующая операция
                    </button>
                    <button
                      onClick={finishServing}
                      className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-mono font-semibold text-sm transition-all"
                    >
                      Завершить обслуживание
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Icon name="UserCheck" size={28} className="text-primary/50" />
              </div>
              <p className="text-muted-foreground font-mono text-sm">Нажмите «Взять следующего»</p>
              <p className="text-muted-foreground/50 font-mono text-xs mt-1">
                {waiting.length > 0 ? `${waiting.length} клиентов ожидают` : 'Очередь пуста'}
              </p>
            </div>
          )}
        </div>
      </div>

      {showCreateAccount && (clientForTicket || activeTicket) && (
        <AccountCreateModal
          client={clientForTicket || { id: '', fullName: activeTicket!.clientName, passport: form.passport || '', phone: '', birthDate: '', address: '', createdAt: '', accounts: [], cards: [] }}
          onCreated={(acc) => {
            onAccountCreated(acc);
            setForm(f => ({ ...f, accountNumber: acc.number, accountOrCard: acc.number }));
            setShowCreateAccount(false);
          }}
          onClose={() => setShowCreateAccount(false)}
          returnLabel="← Вернуться к операции клиента"
        />
      )}
    </div>
  );
}
