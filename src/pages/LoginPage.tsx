import { useState, useEffect } from 'react';
import { Employee } from '@/types/bank';
import { EMPLOYEES } from '@/data/mockData';
import Icon from '@/components/ui/icon';

interface LoginPageProps {
  onLogin: (employee: Employee) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [pendingEmployee, setPendingEmployee] = useState<Employee | null>(null);
  const [otpGenerated, setOtpGenerated] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const employee = EMPLOYEES.find(
      emp => emp.login === login.toUpperCase() && emp.password === password
    );
    if (!employee) {
      setError('Неверный логин или пароль');
      setIsLoading(false);
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpGenerated(code);
    setPendingEmployee(employee);
    setStep('2fa');
    setIsLoading(false);
    setTimeout(() => alert(`[ДЕМО] Ваш код подтверждения: ${code}`), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const entered = otp.join('');
    if (entered !== otpGenerated) {
      setError('Неверный код подтверждения');
      setIsLoading(false);
      return;
    }
    if (pendingEmployee) {
      onLogin(pendingEmployee);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-sm bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Icon name="Shield" size={14} className="text-primary" />
          </div>
          <span className="font-mono text-xs text-muted-foreground tracking-[0.2em] uppercase">АС ЕФС СБОЛ.про</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="status-dot" />
            <span className="font-mono text-xs text-muted-foreground">СИСТЕМА АКТИВНА</span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {currentTime.toLocaleTimeString('ru-RU')}
          </span>
        </div>
      </div>

      {/* Security badges */}
      <div className="absolute left-8 bottom-8 flex flex-col gap-2">
        {['256-BIT AES', 'TLS 1.3', 'ГОСТ Р 34.12'].map(badge => (
          <div key={badge} className="flex items-center gap-2">
            <Icon name="Lock" size={10} className="text-primary/60" />
            <span className="font-mono text-xs text-muted-foreground/50 tracking-[0.15em]">{badge}</span>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
        {/* Logo area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 mb-4 scan-line">
            <Icon name="Building2" size={28} className="text-primary" />
          </div>
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">
            АС ЕФС <span className="text-primary">СБОЛ.про</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-mono tracking-widest">
            АВТОМАТИЗИРОВАННАЯ СИСТЕМА
          </p>
        </div>

        <div className="glass-card rounded-xl p-8">
          {step === 'credentials' ? (
            <>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="font-semibold text-foreground">Авторизация сотрудника</h2>
              </div>
              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-muted-foreground mb-1.5 tracking-widest uppercase">
                    Логин
                  </label>
                  <div className="relative">
                    <Icon name="User" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={login}
                      onChange={e => setLogin(e.target.value)}
                      className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2.5 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-foreground placeholder:text-muted-foreground/50"
                      placeholder="Введите логин"
                      autoFocus
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-xs text-muted-foreground mb-1.5 tracking-widest uppercase">
                    Пароль
                  </label>
                  <div className="relative">
                    <Icon name="KeyRound" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-muted border border-border rounded-lg pl-9 pr-10 py-2.5 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-foreground placeholder:text-muted-foreground/50"
                      placeholder="Введите пароль"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={15} />
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                    <Icon name="AlertTriangle" size={14} className="text-destructive" />
                    <span className="text-destructive text-xs font-mono">{error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span className="font-mono text-sm">ПРОВЕРКА...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="LogIn" size={15} />
                      <span className="font-mono text-sm">ВОЙТИ В СИСТЕМУ</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="font-semibold text-foreground">Двухфакторная аутентификация</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-6 font-mono">
                Код отправлен на зарегистрированный номер сотрудника
              </p>

              <div className="flex items-center gap-3 mb-6 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Icon name="User" size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{pendingEmployee?.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{pendingEmployee?.roleLabel}</p>
                </div>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-6">
                <div>
                  <label className="block font-mono text-xs text-muted-foreground mb-3 tracking-widest uppercase">
                    Код подтверждения
                  </label>
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-12 h-12 text-center font-mono text-lg font-semibold bg-muted border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-foreground"
                        maxLength={1}
                      />
                    ))}
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                    <Icon name="AlertTriangle" size={14} className="text-destructive" />
                    <span className="text-destructive text-xs font-mono">{error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length < 6}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span className="font-mono text-sm">ВЕРИФИКАЦИЯ...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="ShieldCheck" size={15} />
                      <span className="font-mono text-sm">ПОДТВЕРДИТЬ</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtp(['','','','','','']); setError(''); }}
                  className="w-full text-muted-foreground hover:text-foreground text-xs font-mono transition-colors"
                >
                  ← Назад к вводу логина
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-muted-foreground/40 font-mono text-xs mt-6 tracking-widest">
          v1.0.0 · ЗАЩИЩЁННОЕ СОЕДИНЕНИЕ · ЦБ РФ
        </p>
      </div>
    </div>
  );
}
