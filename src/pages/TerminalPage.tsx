import { useState } from 'react';
import Icon from '@/components/ui/icon';

export default function TerminalPage() {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('8080');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString('ru-RU')}] ${msg}`]);
  };

  const handleConnect = async () => {
    if (!ip) return;
    setStatus('connecting');
    addLog(`Инициализация подключения к ${ip}:${port}...`);
    await new Promise(r => setTimeout(r, 800));
    addLog('Отправка запроса авторизации...');
    await new Promise(r => setTimeout(r, 600));
    addLog('Проверка сертификата безопасности...');
    await new Promise(r => setTimeout(r, 500));
    if (ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('172.')) {
      addLog('✓ Подключение установлено');
      addLog('✓ Терминал СБЕР авторизован');
      addLog('✓ Готов к проведению операций');
      setStatus('connected');
    } else {
      addLog('✗ Ошибка: недостижимый адрес или нет ответа');
      setStatus('error');
    }
  };

  const handleDisconnect = () => {
    setStatus('idle');
    addLog('Соединение разорвано');
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
          <Icon name="Monitor" size={20} className="text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Терминал СБЕР</h1>
          <p className="font-mono text-xs text-muted-foreground">Подключение через IP-адрес</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <h3 className="font-semibold text-sm text-foreground">Параметры подключения</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">IP-адрес терминала</label>
                <div className="relative">
                  <Icon name="Network" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={ip}
                    onChange={e => setIp(e.target.value)}
                    placeholder="192.168.1.100"
                    className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2.5 font-mono text-sm focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                    disabled={status === 'connected'}
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Порт</label>
                <input
                  value={port}
                  onChange={e => setPort(e.target.value)}
                  placeholder="8080"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                  disabled={status === 'connected'}
                />
              </div>

              {status !== 'connected' ? (
                <button
                  onClick={handleConnect}
                  disabled={!ip || status === 'connecting'}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-xl font-mono font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {status === 'connecting' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ПОДКЛЮЧЕНИЕ...
                    </>
                  ) : (
                    <>
                      <Icon name="Link" size={15} />
                      ПОДКЛЮЧИТЬ ТЕРМИНАЛ
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/25 py-2.5 rounded-xl font-mono font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Icon name="Unlink" size={15} />
                  ОТКЛЮЧИТЬ
                </button>
              )}
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <h3 className="font-semibold text-sm text-foreground">Статус</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                status === 'connected' ? 'bg-primary' :
                status === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                status === 'error' ? 'bg-destructive' :
                'bg-muted-foreground'
              }`} />
              <span className={`font-mono text-sm font-semibold ${
                status === 'connected' ? 'text-primary' :
                status === 'connecting' ? 'text-yellow-400' :
                status === 'error' ? 'text-destructive' :
                'text-muted-foreground'
              }`}>
                {status === 'connected' ? 'ПОДКЛЮЧЕНО' :
                 status === 'connecting' ? 'ПОДКЛЮЧЕНИЕ...' :
                 status === 'error' ? 'ОШИБКА' : 'НЕ ПОДКЛЮЧЕНО'}
              </span>
            </div>
            {status === 'connected' && (
              <div className="mt-3 space-y-1">
                <p className="font-mono text-xs text-muted-foreground">IP: <span className="text-foreground">{ip}:{port}</span></p>
                <p className="font-mono text-xs text-muted-foreground">Протокол: <span className="text-foreground">TCP/IP v4</span></p>
                <p className="font-mono text-xs text-muted-foreground">Шифрование: <span className="text-primary">TLS 1.3</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Log */}
        <div className="glass-card rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h3 className="font-semibold text-sm text-foreground">Журнал подключения</h3>
          </div>
          <div className="flex-1 bg-background/80 rounded-lg p-3 font-mono text-xs space-y-1 max-h-80 overflow-y-auto border border-border/50">
            {log.length === 0 ? (
              <p className="text-muted-foreground/50">Ожидание подключения...</p>
            ) : (
              log.map((entry, i) => (
                <p key={i} className={`${
                  entry.includes('✓') ? 'text-primary' :
                  entry.includes('✗') ? 'text-destructive' :
                  'text-muted-foreground'
                }`}>{entry}</p>
              ))
            )}
          </div>
          {log.length > 0 && (
            <button
              onClick={() => setLog([])}
              className="mt-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors text-right"
            >
              Очистить лог
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Info" size={15} className="text-primary/60" />
          <p className="font-mono text-xs text-muted-foreground">Инструкция по подключению</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground font-mono">
          <p>1. Включите терминал СБЕР и убедитесь, что он в сети</p>
          <p>2. Введите IP-адрес терминала (из его настроек или стикера)</p>
          <p>3. Порт по умолчанию: 8080. Нажмите «Подключить»</p>
        </div>
      </div>
    </div>
  );
}
