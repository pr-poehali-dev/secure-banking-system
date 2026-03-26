import { useState } from 'react';
import { Client, Account } from '@/types/bank';
import Icon from '@/components/ui/icon';

interface AccountCreateModalProps {
  client: Client;
  onCreated: (account: Account) => void;
  onClose: () => void;
  returnLabel?: string;
}

export default function AccountCreateModal({ client, onCreated, onClose, returnLabel }: AccountCreateModalProps) {
  const [type, setType] = useState<'current' | 'savings' | 'credit'>('current');
  const [currency, setCurrency] = useState('RUB');
  const [created, setCreated] = useState<Account | null>(null);

  const handleCreate = () => {
    const typeLabel = type === 'current' ? 'Текущий счёт' : type === 'savings' ? 'Сберегательный счёт' : 'Кредитный счёт';
    const newAccount: Account = {
      id: `acc_${Date.now()}`,
      clientId: client.id,
      number: '408178100000' + String(Date.now()).slice(-8),
      type,
      typeLabel,
      balance: 0,
      currency,
      status: 'active',
      openedAt: new Date().toISOString().split('T')[0],
    };
    setCreated(newAccount);
    onCreated(newAccount);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <Icon name="CreditCard" size={16} className="text-cyan-400" />
            </div>
            <h3 className="font-semibold text-foreground">Открытие счёта</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {!created ? (
          <div className="p-5 space-y-4">
            <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg">
              <p className="text-xs text-muted-foreground font-mono">Клиент</p>
              <p className="font-semibold text-foreground text-sm mt-0.5">{client.fullName}</p>
              <p className="font-mono text-xs text-muted-foreground">{client.passport}</p>
            </div>

            <div>
              <label className="block font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">Тип счёта</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'current', label: 'Текущий' },
                  { value: 'savings', label: 'Сберег.' },
                  { value: 'credit', label: 'Кредитный' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value as 'current' | 'savings' | 'credit')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                      type === opt.value
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">Валюта</label>
              <div className="flex gap-2">
                {['RUB', 'USD', 'EUR'].map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`py-2 px-4 rounded-lg text-xs font-mono font-medium border transition-all ${
                      currency === c
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-semibold font-mono text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Icon name="Plus" size={15} />
              ОТКРЫТЬ СЧЁТ
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                <Icon name="CheckCircle" size={28} className="text-primary" />
              </div>
              <p className="font-semibold text-foreground">Счёт успешно открыт!</p>
              <p className="text-muted-foreground text-xs font-mono mt-1">{created.typeLabel}</p>
            </div>
            <div className="bg-muted rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground font-mono">Номер счёта</span>
                <span className="font-mono text-xs text-foreground font-semibold">{created.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground font-mono">Тип</span>
                <span className="text-xs text-foreground">{created.typeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground font-mono">Валюта</span>
                <span className="font-mono text-xs text-foreground">{created.currency}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-2.5 rounded-lg font-semibold font-mono text-sm flex items-center justify-center gap-2 transition-all border border-primary/25"
            >
              <Icon name="ArrowLeft" size={15} />
              {returnLabel || 'Закрыть'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
