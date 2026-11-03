import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { useFoodTruck } from '../../context/FoodTruckContext';
import { Clock, UtensilsCrossed, ShoppingBag, Flame, CheckCircle, Bell, Printer } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onPrintReceipt: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPrintReceipt }) => {
  const { updateOrderStatus, callOrder } = useFoodTruck();
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const start = new Date(order.createdAt).getTime();
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSecs = elapsedSeconds % 60;
  const formattedTimer = `${elapsedMinutes}m ${remainingSecs < 10 ? '0' : ''}${remainingSecs}s`;

  // Color urgency
  let urgencyClass = 'border-slate-800 bg-slate-900';
  let timerBadgeClass = 'bg-slate-800 text-slate-300';

  if (order.status === 'queued' || order.status === 'preparing') {
    if (elapsedMinutes >= 10) {
      urgencyClass = 'border-rose-500/80 bg-rose-950/20 shadow-lg shadow-rose-950/30';
      timerBadgeClass = 'bg-rose-500/20 text-rose-300 font-bold';
    } else if (elapsedMinutes >= 5) {
      urgencyClass = 'border-amber-500/70 bg-amber-950/20';
      timerBadgeClass = 'bg-amber-500/20 text-amber-300 font-bold';
    } else {
      urgencyClass = 'border-emerald-500/40 bg-slate-900';
      timerBadgeClass = 'bg-emerald-500/20 text-emerald-300 font-bold';
    }
  }

  return (
    <div
      className={`rounded-2xl border ${urgencyClass} p-4 flex flex-col justify-between space-y-3 shadow-md transition-all`}
    >
      {/* Card Header: Order Number, Type & Timer */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              #{order.orderNumber}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${
                order.orderType === 'dine_in'
                  ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                  : 'bg-sky-400/10 text-sky-300 border border-sky-400/20'
              }`}
            >
              {order.orderType === 'dine_in' ? (
                <>
                  <UtensilsCrossed className="w-3 h-3" />
                  <span>Local</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" />
                  <span>Viagem</span>
                </>
              )}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-300 mt-0.5 truncate max-w-[180px]">
            {order.customerName}
          </p>
        </div>

        {/* Timer */}
        <div className={`px-2.5 py-1 rounded-lg font-mono text-xs flex items-center gap-1 shrink-0 ${timerBadgeClass}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{formattedTimer}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2.5 py-1 flex-1">
        {order.items.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-bold text-white leading-tight">
                <span className="text-amber-400 font-mono text-base mr-1.5">{item.quantity}x</span>
                {item.name}
              </span>
            </div>

            {/* Customization callouts */}
            {(item.customization?.doneness ||
              item.customization?.extras?.length ||
              item.customization?.removals?.length ||
              item.customization?.notes) && (
              <div className="pl-5 space-y-0.5 text-xs text-slate-300">
                {item.customization?.doneness && (
                  <p className="font-semibold text-amber-300">
                    {item.customization.doneness.includes('Açúcar')
                      ? 'Massa: '
                      : item.customization.doneness.includes('Pepper') || item.customization.doneness.includes('Páprica')
                      ? 'Tempero: '
                      : 'Opção: '}
                    {item.customization.doneness}
                  </p>
                )}
                {item.customization?.extras?.map(e => (
                  <p key={e.id} className="text-emerald-400 font-medium">
                    + {e.name}
                  </p>
                ))}
                {item.customization?.removals?.map(r => (
                  <p key={r} className="text-rose-400 font-bold uppercase tracking-wide">
                    ⚠️ {r}
                  </p>
                ))}
                {item.customization?.notes && (
                  <div className="bg-amber-950/60 border border-amber-500/50 rounded px-2 py-1 text-xs text-amber-200 font-medium flex items-start gap-1.5 mt-0.5">
                    <span className="font-bold text-amber-400 shrink-0">OBS:</span>
                    <span className="font-semibold">{item.customization.notes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {order.notes && (
          <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 italic">
            Obs Geral: {order.notes}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => onPrintReceipt(order)}
          title="Reimprimir comanda térmica"
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
        >
          <Printer className="w-4 h-4" />
        </button>

        {order.status === 'queued' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            className="flex-1 h-10 px-3 bg-[#A91D22] hover:bg-[#8e161c] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Flame className="w-4 h-4 fill-white" />
            <span>Iniciar Produção (Montagem / Forno)</span>
          </button>
        )}

        {order.status === 'preparing' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'ready')}
            className="flex-1 h-10 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Bell className="w-4 h-4 fill-slate-950" />
            <span>Pronto para Retirada!</span>
          </button>
        )}

        {order.status === 'ready' && (
          <div className="flex-1 flex gap-2">
            <button
              onClick={() => callOrder(order.orderNumber)}
              title="Tocar alerta sonoro e chamar senha no monitor"
              className="px-3 h-10 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>Chamar</span>
            </button>
            <button
              onClick={() => updateOrderStatus(order.id, 'delivered')}
              className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Entregue</span>
            </button>
          </div>
        )}

        {order.status === 'delivered' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'ready')}
            className="flex-1 h-9 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Reabrir Pedido</span>
          </button>
        )}
      </div>

    </div>
  );
};
