import { useState } from 'react';
import { Employee, Client, Account, Transaction, QueueItem, AppSection } from '@/types/bank';
import {
  EMPLOYEES, INITIAL_CLIENTS, INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, INITIAL_QUEUE
} from '@/data/mockData';

import LoginPage from '@/pages/LoginPage';
import Sidebar from '@/components/Sidebar';
import DashboardHome from '@/pages/DashboardHome';
import CashOutPage from '@/pages/CashOutPage';
import CashInPage from '@/pages/CashInPage';
import QueuePage from '@/pages/QueuePage';
import ClientsPage from '@/pages/ClientsPage';
import AccountsPage from '@/pages/AccountsPage';
import HistoryPage from '@/pages/HistoryPage';
import ReportsPage from '@/pages/ReportsPage';
import CreditsPage from '@/pages/CreditsPage';
import ProfilePage from '@/pages/ProfilePage';
import TerminalPage from '@/pages/TerminalPage';
import CardsPage from '@/pages/CardsPage';
import Icon from '@/components/ui/icon';

// Suppress unused import warning
void EMPLOYEES;

export default function App() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [section, setSection] = useState<AppSection>('dashboard');
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [currentTime, setCurrentTime] = useState(new Date());

  useState(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  });

  const handleLogin = (emp: Employee) => {
    setEmployee(emp);
    setSection('dashboard');
  };

  const handleLogout = () => {
    setEmployee(null);
  };

  const handleTransaction = (txn: Transaction) => {
    setTransactions(prev => [...prev, txn]);
    setAccounts(prev => prev.map(acc => {
      if (acc.number === txn.accountNumber) {
        if (txn.type === 'cash_out') return { ...acc, balance: acc.balance - txn.amount };
        if (txn.type === 'cash_in') return { ...acc, balance: acc.balance + txn.amount };
      }
      return acc;
    }));
  };

  const handleAccountCreated = (account: Account) => {
    setAccounts(prev => [...prev, account]);
    setClients(prev => prev.map(c =>
      c.id === account.clientId
        ? { ...c, accounts: [...c.accounts, account] }
        : c
    ));
  };

  const handleClientAdded = (client: Client) => {
    setClients(prev => [...prev, client]);
  };

  if (!employee) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const SECTION_TITLES: Record<AppSection, string> = {
    dashboard: 'Главная',
    cash_out: 'Выдача наличных',
    cash_in: 'Взнос наличных',
    queue: 'Электронная очередь',
    clients: 'Клиентская база',
    accounts: 'Учёт счетов',
    cards: 'Выпуск карт',
    history: 'История операций',
    reports: 'Отчёты и аналитика',
    credits: 'Кредит / Рассрочка',
    profile: 'Личный кабинет',
    terminal: 'Терминал СБЕР',
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        employee={employee}
        activeSection={section}
        onSectionChange={setSection}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">{SECTION_TITLES[section]}</h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={13} className="text-primary/60" />
              <span className="font-mono text-xs text-muted-foreground">ЗАЩИТА АКТИВНА</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="status-dot scale-75" />
              <span className="font-mono text-xs text-muted-foreground">
                {currentTime.toLocaleTimeString('ru-RU')}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-border">
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="font-mono text-xs font-bold text-primary">
                  {employee.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground leading-none">{employee.name.split(' ')[0]} {employee.name.split(' ')[1]}</p>
                <p className="font-mono text-xs text-muted-foreground leading-none mt-0.5">{employee.tabNumber}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {section === 'dashboard' && (
            <DashboardHome
              employee={employee}
              transactions={transactions}
              queue={queue}
              accounts={accounts}
              onSectionChange={setSection}
            />
          )}
          {section === 'cash_out' && (
            <CashOutPage
              clients={clients}
              accounts={accounts}
              employee={employee}
              onTransaction={handleTransaction}
              onAccountCreated={handleAccountCreated}
            />
          )}
          {section === 'cash_in' && (
            <CashInPage
              clients={clients}
              accounts={accounts}
              employee={employee}
              onTransaction={handleTransaction}
              onAccountCreated={handleAccountCreated}
            />
          )}
          {section === 'queue' && (
            <QueuePage
              queue={queue}
              clients={clients}
              accounts={accounts}
              employee={employee}
              onQueueUpdate={setQueue}
              onTransaction={handleTransaction}
              onAccountCreated={handleAccountCreated}
            />
          )}
          {section === 'clients' && (
            <ClientsPage
              clients={clients}
              accounts={accounts}
              onClientAdded={handleClientAdded}
              onAccountCreated={handleAccountCreated}
            />
          )}
          {section === 'accounts' && (
            <AccountsPage
              accounts={accounts}
              clients={clients}
              onAccountCreated={handleAccountCreated}
            />
          )}
          {section === 'cards' && (
            <CardsPage
              clients={clients}
              accounts={accounts}
              employee={employee}
              onAccountCreated={handleAccountCreated}
            />
          )}
          {section === 'history' && (
            <HistoryPage transactions={transactions} />
          )}
          {section === 'reports' && (
            <ReportsPage transactions={transactions} accounts={accounts} />
          )}
          {section === 'credits' && (
            <CreditsPage
              clients={clients}
              accounts={accounts}
              employee={employee}
              onTransaction={handleTransaction}
              onAccountCreated={handleAccountCreated}
            />
          )}
          {section === 'profile' && (
            <ProfilePage employee={employee} />
          )}
          {section === 'terminal' && (
            <TerminalPage />
          )}
        </main>
      </div>
    </div>
  );
}