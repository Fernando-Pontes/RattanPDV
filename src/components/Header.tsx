import React, { useState, useEffect, useRef } from 'react';
import { useFoodTruck } from '../context/FoodTruckContext';
import { useAuth } from '../context/AuthContext';
import {
  Volume2,
  VolumeX,
  PlusCircle,
  Menu,
  X,
  ShoppingBag,
  Flame,
  Tv,
  UtensilsCrossed,
  Receipt,
  ChevronRight,
  Cloud,
  HardDrive,
  LogOut,
  User,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    soundEnabled,
    setSoundEnabled,
    orders,
    simulateSampleOrder,
    isFirebase,
  } = useFoodTruck();
  const { currentUser, logout, isManager } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const queuedCount = orders.filter(o => o.status === 'queued').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const kitchenAlertCount = queuedCount + preparingCount;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const navItems = [
    {
      id: 'pdv' as const,
      label: 'Frente de Caixa (PDV)',
      description: 'Lançamento de pedidos & balcão',
      icon: ShoppingBag,
    },
    {
      id: 'kds' as const,
      label: 'Cozinha (KDS)',
      description: 'Monitor de produção & forno',
      icon: Flame,
      badge: kitchenAlertCount > 0 ? kitchenAlertCount : undefined,
    },
    {
      id: 'tv' as const,
      label: 'Painel TV Clientes',
      description: 'Painel de senhas prontas',
      icon: Tv,
    },
    ...(isManager
      ? [
          {
            id: 'menu' as const,
            label: 'Cardápio & Estoque',
            description: 'Gestão de sandubas, rolls e chips',
            icon: UtensilsCrossed,
          },
        ]
      : []),
    {
      id: 'reports' as const,
      label: 'Fechamento de Caixa',
      description: 'Relatório financeiro do turno',
      icon: Receipt,
    },
  ];

  const handleNavClick = (viewId: typeof activeView) => {
    setActiveView(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('pdv')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#A91D22] flex items-center justify-center text-white font-black text-xl shadow-md shadow-red-900/30 shrink-0">
              <span className="font-display tracking-tight text-xl">RP</span>
            </div>
            <div className="min-w-0">
              <span className="font-display text-xl sm:text-2xl font-bold tracking-wide text-white group-hover:text-red-400 transition-colors whitespace-nowrap block leading-none">
                RATTAN PÃES
              </span>
              <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-mono truncate max-w-[190px] sm:max-w-none">
                Esmagatto Levain · Cinnamon Roll · Cafeteria
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Desktop Navigation Links (Visible on xl screens where plenty of space is guaranteed) */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-stone-400">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 relative flex items-center gap-1.5 ${
                  isActive ? 'text-[#e13a43] font-bold' : 'hover:text-stone-200'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="text-xs font-mono font-bold bg-[#A91D22]/20 text-red-300 px-1.5 py-0.2 rounded-md">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A91D22] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Hamburger Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Firebase / localStorage mode badge */}
          <div
            title={isFirebase ? 'Modo Firebase: dados sincronizados na nuvem em tempo real' : 'Modo Local: dados salvos apenas neste navegador'}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
              isFirebase
                ? 'bg-blue-950/60 border-blue-700/40 text-blue-300'
                : 'bg-stone-900 border-stone-800 text-stone-500'
            }`}
          >
            {isFirebase ? <Cloud className="w-3.5 h-3.5" /> : <HardDrive className="w-3.5 h-3.5" />}
            <span>{isFirebase ? 'Firebase' : 'Local'}</span>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Silenciar avisos sonoros' : 'Ativar avisos sonoros'}
            className="w-9 h-9 rounded-lg border border-stone-800 bg-stone-900 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Controle de Som"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>

          {/* Quick Simulation Order Button (compact on mobile) */}
          <button
            onClick={simulateSampleOrder}
            title="Simula um novo pedido chegando do balcão"
            className="px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-[#A91D22] hover:bg-[#8e161c] rounded-lg shadow-sm transition-all active:scale-[0.98] whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Simular Pedido</span>
            <span className="sm:hidden">Simular</span>
          </button>

          {/* Current Operator Profile & Logout (Desktop) */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-stone-800">
              <div
                title={`Operador logado: ${currentUser.name} (${currentUser.username})`}
                className="w-8 h-8 rounded-lg bg-red-950/70 border border-red-800/50 flex items-center justify-center text-red-200 font-bold text-xs uppercase shadow-sm"
              >
                {currentUser.name.charAt(0) || 'O'}
              </div>
              <div className="text-left text-xs leading-tight">
                <span className="block font-semibold text-stone-200 truncate max-w-[90px] sm:max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="block text-[10px] text-stone-400 font-mono">
                  {currentUser.role || 'Operador'}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sair / Trocar Operador"
                className="p-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-red-950/80 hover:border-red-900/60 text-stone-400 hover:text-red-300 transition-colors cursor-pointer"
                aria-label="Sair do sistema"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Hamburger Menu Toggle Button (Visible on screens smaller than xl) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Menu de Navegação"
            className={`xl:hidden relative w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
              isMobileMenuOpen
                ? 'bg-[#A91D22] border-[#A91D22] text-white shadow-sm'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            
            {/* Notification pip on hamburger icon if there are pending kitchen orders */}
            {!isMobileMenuOpen && kitchenAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#A91D22] ring-2 ring-stone-950" />
            )}
          </button>
        </div>

      </div>

      {/* Hamburger Drawer / Dropdown Menu for Mobile & Tablet */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 z-40 bg-black/70 backdrop-blur-sm xl:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Drawer Panel */}
          <div
            ref={menuRef}
            className="absolute top-16 left-0 right-0 z-50 bg-stone-950 border-b border-stone-800 shadow-2xl xl:hidden max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200"
          >
            <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-900">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">
                  Navegação do Sistema
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  Rattan Pães de Levain
                </span>
              </div>

              {/* Operator info in drawer */}
              {currentUser && (
                <div className="p-3 bg-stone-900/90 rounded-xl border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-200 font-bold text-sm uppercase">
                      {currentUser.name.charAt(0) || 'O'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{currentUser.name}</span>
                        <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded font-mono">
                          {currentUser.username}
                        </span>
                      </div>
                      <span className="text-xs text-stone-400">{currentUser.role || 'Operador'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>
              )}

              {/* Navigation Items List */}
              <div className="grid gap-2">
                {navItems.map(item => {
                  const isActive = activeView === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all active:scale-[0.99] ${
                        isActive
                          ? 'bg-[#A91D22]/15 border-[#A91D22] text-white shadow-md'
                          : 'bg-stone-900/80 border-stone-800/90 text-stone-300 hover:text-white hover:bg-stone-900 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-[#A91D22] text-white shadow-sm'
                              : 'bg-stone-950 border border-stone-800 text-stone-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white tracking-wide">
                              {item.label}
                            </span>
                            {item.badge !== undefined && (
                              <span className="text-[11px] font-mono font-bold bg-[#A91D22] text-white px-2 py-0.5 rounded-full shadow-xs">
                                {item.badge} pendente{item.badge > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-400 truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive ? 'text-[#A91D22] translate-x-0.5' : 'text-stone-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-3 border-t border-stone-900 flex items-center justify-between gap-3 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Sistema Online · Balcão Ativo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white text-xs font-semibold"
                >
                  Fechar Menu
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </header>
  );
};
