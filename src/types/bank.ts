export type UserRole = 'senior_operator' | 'operator' | 'manager';

export interface Employee {
  id: string;
  login: string;
  password: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  tabNumber: string;
}

export interface Client {
  id: string;
  fullName: string;
  passport: string;
  phone: string;
  email?: string;
  birthDate: string;
  address: string;
  createdAt: string;
  accounts: Account[];
  cards: Card[];
}

export interface Account {
  id: string;
  clientId: string;
  number: string;
  type: 'current' | 'savings' | 'credit';
  typeLabel: string;
  balance: number;
  currency: string;
  status: 'active' | 'blocked' | 'closed';
  openedAt: string;
}

export interface Card {
  id: string;
  clientId: string;
  accountId: string;
  number: string;
  holderName: string;
  expiryDate: string;
  type: 'debit' | 'credit';
  status: 'active' | 'blocked';
  issuedAt: string;
}

export interface Transaction {
  id: string;
  type: 'cash_out' | 'cash_in' | 'credit' | 'card_issue' | 'transfer';
  typeLabel: string;
  clientId: string;
  clientName: string;
  accountNumber: string;
  amount: number;
  currency: string;
  operatorId: string;
  operatorName: string;
  timestamp: string;
  status: 'success' | 'pending' | 'cancelled';
  documentOKUD?: string;
  notes?: string;
}

export interface QueueItem {
  id: string;
  ticketNumber: string;
  clientId?: string;
  clientName: string;
  operations: OperationType[];
  status: 'waiting' | 'serving' | 'done' | 'cancelled';
  arrivedAt: string;
  calledAt?: string;
  doneAt?: string;
  windowNumber?: number;
}

export type OperationType =
  | 'cash_out'
  | 'cash_in'
  | 'credit'
  | 'installment'
  | 'card_issue'
  | 'account_open'
  | 'transfer'
  | 'other';

export interface Credit {
  id: string;
  clientId: string;
  clientName: string;
  passport: string;
  accountNumber: string;
  amount: number;
  term: number;
  rate: number;
  monthlyPayment: number;
  type: 'credit' | 'installment';
  status: 'active' | 'closed' | 'overdue';
  issuedAt: string;
  closedAt?: string;
}

export type AppSection =
  | 'dashboard'
  | 'cash_out'
  | 'cash_in'
  | 'queue'
  | 'clients'
  | 'accounts'
  | 'history'
  | 'reports'
  | 'credits'
  | 'profile'
  | 'terminal';
