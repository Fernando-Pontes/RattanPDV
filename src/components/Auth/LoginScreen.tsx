import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  AlertCircle,
  Cloud,
  HardDrive,
  Sparkles,
  Info,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, isFirebaseActive } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login(username, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Credenciais inválidas.');
      }
    } catch {
      setErrorMessage('Ocorreu um erro ao validar os dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillGuilherme = () => {
    setUsername('guilherme');
    setPassword('123456');
    setErrorMessage(null);
  };

  const handleFillGislaine = () => {
    setUsername('gislaine');
    setPassword('123456');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#A91D22]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-900/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#A91D22] text-white font-black text-2xl shadow-xl shadow-red-950/50 mb-3 border border-red-500/30">
            <span className="font-display tracking-tight text-3xl">RP</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-white">
            RATTAN PÃES
          </h1>
          <p className="text-xs uppercase tracking-widest text-stone-400 font-mono mt-1">
            Esmagatto Levain · Cafeteria & Rolls
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminal Operacional Restrito</span>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <LogIn className="w-5 h-5 text-[#A91D22]" />
              Identificação do Operador
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Informe seu usuário e senha para acessar o caixa e a produção.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-950/70 border border-red-800/80 rounded-xl flex items-start gap-3 text-red-200 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-red-300">Falha na autenticação</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-stone-300 mb-1.5 uppercase tracking-wider"
              >
                Usuário / Operador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Ex: guilherme"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-[#A91D22] focus:ring-1 focus:ring-[#A91D22] transition-colors text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-stone-300 mb-1.5 uppercase tracking-wider"
              >
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-[#A91D22] focus:ring-1 focus:ring-[#A91D22] transition-colors text-sm font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-[#A91D22] hover:bg-[#8e161c] text-white font-bold rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando credenciais...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Acessar o Sistema</span>
                </>
              )}
            </button>
          </form>

          {/* Quick preset & Firebase hint */}
          <div className="mt-6 pt-5 border-t border-stone-800/80 space-y-3">
            <div className="space-y-2">
              <span className="text-xs text-stone-400 font-medium block">Acesso rápido aos operadores:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleFillGuilherme}
                  className="px-2.5 py-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-400/60 text-xs text-stone-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold truncate">Guilherme (Gerente)</span>
                </button>
                <button
                  type="button"
                  onClick={handleFillGislaine}
                  className="px-2.5 py-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-emerald-400/60 text-xs text-stone-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold truncate">Gislaine (Operadora)</span>
                </button>
              </div>
            </div>

            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 text-[11px] text-stone-400 space-y-1.5">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-stone-300 font-medium">
                    Operadores: <span className="font-mono text-amber-300">guilherme</span> (Gerente) e <span className="font-mono text-emerald-300">gislaine</span> (Operadora de Caixa)
                  </p>
                  <p className="text-stone-500 text-[10px] mt-0.5">
                    Gislaine acessa PDV, KDS e Relatórios, mas não visualiza "Cardápio & Estoque".
                  </p>
                </div>
              </div>
            </div>

            {/* Storage status badge */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
              {isFirebaseActive ? (
                <span className="flex items-center gap-1 text-blue-400">
                  <Cloud className="w-3.5 h-3.5" /> Firebase Firestore Conectado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-stone-500">
                  <HardDrive className="w-3.5 h-3.5" /> Modo Local Ativo
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-stone-600 mt-6 font-mono">
          Rattan Pães de Levain · Versão 1.2
        </p>
      </div>
    </div>
  );
};
