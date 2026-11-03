import React, { useState } from 'react';
import { useFoodTruck } from '../../context/FoodTruckContext';
import { soundManager } from '../../utils/sound';
import { Maximize2, Minimize2, Bell, Sparkles, UtensilsCrossed } from 'lucide-react';

export const CustomerTVView: React.FC = () => {
  const { orders, lastCalledOrderNumber } = useFoodTruck();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const preparingOrders = orders.filter(o => o.status === 'preparing' || o.status === 'queued');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleCall = (num: number) => {
    soundManager.playOrderReady();
  };

  return (
    <div className="flex-1 w-full bg-slate-950 flex flex-col p-4 sm:p-8 select-none">
      
      {/* TV Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#A91D22] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-red-950">
            <span className="font-display">RP</span>
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-wide text-white uppercase">
              RATTAN PÃES
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 font-medium">
              Cinnamon Roll · Fatia Húngara · Bebidas & Cafeteria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => lastCalledOrderNumber && handleCall(lastCalledOrderNumber)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95"
            title="Repetir som de chamada de senha"
          >
            <Bell className="w-4 h-4" />
            <span>Tocar Chamada</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Alternar tela cheia na TV"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Split Grid for TV */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 items-stretch">
        
        {/* Left Side: PREPARANDO */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-200">
                Preparando na Cozinha
              </h2>
            </div>
            <span className="text-sm font-mono font-bold text-slate-400">
              {preparingOrders.length} pedido(s)
            </span>
          </div>

          <div className="flex-1 py-6 overflow-y-auto">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 text-center p-8">
                <p className="text-base font-semibold">Nenhum pedido sendo preparado agora.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {preparingOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center shadow-inner"
                  >
                    <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 mt-1 truncate max-w-[120px]">
                      {order.customerName}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase mt-0.5">
                      {order.status === 'preparing' ? 'Em Preparo' : 'Na Fila'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: PRONTO PARA RETIRADA */}
        <div className="bg-emerald-950/20 border-2 border-emerald-500/50 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center justify-between pb-4 border-b border-emerald-500/30">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                <span>Pronto para Retirada!</span>
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </h2>
            </div>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {readyOrders.length} pronto(s)
            </span>
          </div>

          <div className="flex-1 py-6 overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 text-center p-8">
                <p className="text-base font-semibold">Aguardando próximos pedidos prontos...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {readyOrders.map(order => {
                  const isLatestCalled = order.orderNumber === lastCalledOrderNumber;
                  return (
                    <div
                      key={order.id}
                      onClick={() => handleCall(order.orderNumber)}
                      className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-xl ${
                        isLatestCalled
                          ? 'bg-gradient-to-r from-emerald-500/30 to-emerald-600/20 border-emerald-400 shadow-emerald-500/20 scale-[1.02]'
                          : 'bg-slate-950 border-emerald-500/30 hover:border-emerald-500/60'
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black font-mono text-3xl shadow-lg">
                          #{order.orderNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl sm:text-2xl font-black text-white">
                              {order.customerName}
                            </h3>
                            {isLatestCalled && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wide">
                                Chamando Agora!
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-emerald-300 font-medium mt-0.5">
                            Por favor dirija-se ao balcão para retirar seu pedido
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                        <UtensilsCrossed className="w-4 h-4" />
                        <span>{order.items.length} item(s)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-emerald-500/20 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Apresente o comprovante ou número da senha ao atendente no balcão.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
