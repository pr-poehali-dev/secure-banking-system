import { useState } from 'react';
import { Client, Account, Transaction, Employee } from '@/types/bank';
import AccountCreateModal from '@/components/modals/AccountCreateModal';
import Icon from '@/components/ui/icon';

interface CashOutPageProps {
  clients: Client[];
  accounts: Account[];
  employee: Employee;
  onTransaction: (txn: Transaction) => void;
  onAccountCreated: (account: Account) => void;
}

const formatMoney = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(v);

function generateOKUD0402009(data: {
  clientName: string; accountNumber: string; amount: number;
  operatorName: string; passport: string; date: string;
}) {
  const text = `
РАСХОДНЫЙ КАССОВЫЙ ОРДЕР
Форма по ОКУД 0402009

Организация: АС ЕФС СБОЛ.про
Дата: ${data.date}
═══════════════════════════════════════════════════
Выдать: ${data.clientName}
Паспорт: ${data.passport}
Счёт: ${data.accountNumber}
Сумма: ${formatMoney(data.amount)}
(${amountToWords(data.amount)})
═══════════════════════════════════════════════════
Основание: Выдача наличных денежных средств
Кассир: ${data.operatorName}
═══════════════════════════════════════════════════
Подпись получателя: ___________________
Подпись кассира: ___________________
  `.trim();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ОКУД-0402009_${data.date.replace(/\./g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function amountToWords(amount: number): string {
  return `${amount.toLocaleString('ru-RU')} рублей 00 копеек`;
}

export default function CashOutPage({ clients, accounts, employee, onTransaction, onAccountCreated }: CashOutPageProps) {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState<Transaction | null>(null);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filtered = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.passport.includes(search) ||
    c.phone.includes(search)
  );

  const clientAccounts = selectedClient
    ? accounts.filter(a => a.clientId === selectedClient.id && a.status === 'active')
    : [];

  const selectedAccount = accounts.find(a => a.number === accountNumber);

  const handleExecute = async () => {
    setError('');
    const amt = parseFloat(amount.replace(/\s/g, '').replace(',', '.'));
    if (!selectedClient) return setError('Выберите клиента');
    if (!accountNumber) return setError('Введите номер счёта');
    if (!selectedAccount) {
      setError('Счёт не найден в системе. Хотите создать новый счёт?');
      return;
    }
    if (isNaN(amt) || amt <= 0) return setError('Введите корректную сумму');
    if (selectedAccount.balance < amt) return setError('Недостаточно средств на счёте');

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const txn: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'cash_out',
      typeLabel: 'Выдача наличных',
      clientId: selectedClient.id,
      clientName: selectedClient.fullName,
      accountNumber,
      amount: amt,
      currency: 'RUB',
      operatorId: employee.id,
      operatorName: employee.name,
      timestamp: new Date().toISOString(),
      status: 'success',
      documentOKUD: '0402009',
    };
    onTransaction(txn);
    setDone(txn);
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!done || !selectedClient) return;
    generateOKUD0402009({
      clientName: selectedClient.fullName,
      accountNumber: done.accountNumber,
      amount: done.amount,
      operatorName: employee.name,
      passport: selectedClient.passport,
      date: new Date().toLocaleDateString('ru-RU'),
    });
  };

  const handleReset = () => {
    setDone(null); setSelectedClient(null); setAccountNumber(''); setAmount(''); setSearch(''); setError('');
  };

  if (done) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md animate-scale-in">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Операция выполнена</h2>
            <p className="text-muted-foreground text-sm font-mono mb-6">ВЫДАЧА НАЛИЧНЫХ · ОКУД 0402009</p>

            <div className="bg-muted rounded-xl p-4 space-y-3 text-left mb-6">
              {[
                { label: 'Клиент', value: selectedClient?.fullName },
                { label: 'Сумма', value: formatMoney(done.amount) },
                { label: 'Счёт', value: done.accountNumber },
                { label: 'Время', value: new Date(done.timestamp).toLocaleTimeString('ru-RU') },
                { label: 'ID операции', value: done.id },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground font-mono">{row.label}</span>
                  <span className="text-xs text-foreground font-semibold font-mono">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 py-2.5 rounded-xl font-mono text-sm font-semibold transition-all"
              >
                <Icon name="Download" size={15} />
                ОКУД 0402009
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-xl font-mono text-sm font-semibold transition-all"
              >
                Новая операция
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
          <Icon name="ArrowUpFromLine" size={20} className="text-yellow-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Выдача наличных</h1>
          <p className="font-mono text-xs text-muted-foreground">ОКУД 0402009 · Расходный кассовый ордер</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Client selection */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-yellow-400 rounded-full" />
            <h3 className="font-semibold text-sm text-foreground">1. Выберите клиента</h3>
          </div>
          <div className="relative mb-3">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ФИО, паспорт или телефон..."
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-all font-mono text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {filtered.map(client => (
              <button
                key={client.id}
                onClick={() => { setSelectedClient(client); setAccountNumber(''); }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedClient?.id === client.id
                    ? 'bg-primary/10 border-primary/30 text-foreground'
                    : 'bg-muted/50 border-border/50 hover:border-border text-foreground'
                }`}
              >
                <p className="text-sm font-medium">{client.fullName}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">{client.passport} · {client.phone}</p>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground text-xs font-mono py-4">Клиент не найден</p>
            )}
          </div>
        </div>

        {/* Operation form */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-yellow-400 rounded-full" />
            <h3 className="font-semibold text-sm text-foreground">2. Параметры операции</h3>
          </div>

          {selectedClient ? (
            <div className="space-y-4">
              <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon name="UserCheck" size={14} className="text-primary" />
                  <p className="text-xs font-semibold text-foreground">{selectedClient.fullName}</p>
                </div>
                <p className="font-mono text-xs text-muted-foreground mt-1">{selectedClient.passport}</p>
              </div>

              {clientAccounts.length > 0 && (
                <div>
                  <p className="font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">Счета клиента</p>
                  <div className="space-y-1.5">
                    {clientAccounts.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => setAccountNumber(acc.number)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                          accountNumber === acc.number
                            ? 'bg-primary/10 border-primary/30'
                            : 'bg-muted/50 border-border/50 hover:border-border'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="font-mono text-foreground">{acc.number}</span>
                          <span className="text-primary font-semibold font-mono">{formatMoney(acc.balance)}</span>
                        </div>
                        <span className="text-muted-foreground">{acc.typeLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Номер счёта</label>
                <input
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="40817810000000000000"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                />
                {clientAccounts.length === 0 && (
                  <button
                    onClick={() => setShowCreateAccount(true)}
                    className="mt-1.5 text-xs text-primary hover:text-primary/70 font-mono transition-colors flex items-center gap-1"
                  >
                    <Icon name="Plus" size={12} /> Создать новый счёт
                  </button>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Сумма выдачи (₽)</label>
                <input
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  min="1"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 font-mono text-lg focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition-all text-foreground placeholder:text-muted-foreground/50"
                />
                {selectedAccount && (
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    Остаток: <span className="text-primary">{formatMoney(selectedAccount.balance)}</span>
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                  <Icon name="AlertTriangle" size={14} className="text-destructive" />
                  <div className="flex-1">
                    <span className="text-destructive text-xs font-mono">{error}</span>
                    {error.includes('не найден') && (
                      <button
                        onClick={() => setShowCreateAccount(true)}
                        className="block mt-1 text-xs text-primary font-mono hover:underline"
                      >
                        → Создать счёт
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleExecute}
                disabled={isLoading || !amount || !accountNumber}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 font-mono"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <Icon name="ArrowUpFromLine" size={16} />
                )}
                ВЫДАТЬ НАЛИЧНЫЕ
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Icon name="UserSearch" size={32} className="mb-3 opacity-30" />
              <p className="text-sm font-mono">Выберите клиента</p>
            </div>
          )}
        </div>
      </div>

      {showCreateAccount && selectedClient && (
        <AccountCreateModal
          client={selectedClient}
          onCreated={(acc) => {
            onAccountCreated(acc);
            setAccountNumber(acc.number);
            setShowCreateAccount(false);
          }}
          onClose={() => setShowCreateAccount(false)}
          returnLabel="← Вернуться к операции выдачи"
        />
      )}
    </div>
  );
}
