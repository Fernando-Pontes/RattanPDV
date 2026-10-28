import React, { useState } from 'react';
import { useFoodTruck } from '../../context/FoodTruckContext';
import { OrderCard } from './OrderCard';
import { Order } from '../../types';
import { ReceiptModal } from '../PDV/ReceiptModal';
import { Clock, Flame, CheckCircle2, History, AlertTriangle, Volume2 } from 'lucide-react';
import { soundManager } from '../../utils/sound';

export const KDSView: React.FC = () => {
  const { orders } = useFoodTruck();
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [showDelivered, setShowDelivered] = useState<boolean>(false);

  const queuedOrders = orders.filter(o => o.status === 'queued');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const deliveredOrders = orders.filter(o => o.status === 'delivered').slice(0, 10);

  // Delayed orders (> 10 mins and still queued or preparing)
  const delayedCount = [...queuedOrders, ...preparingOrders].filter(o => {
    const elapsedMins = (Date.now() - new Date(o.createdAt).getTime()) / 60000;
    return elapsedMins >= 10;
  }).length;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col space-y-4">
      
      {/* KDS Control Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-sub uppercase tracking-wider">
              Monitor de Produção & Forno (KDS)
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{queuedOrders.length + preparingOrders.length} pedidos em andamento</span>
              {delayedCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {delayedCount} pedido(s) atrasado(s) (+10min)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => soundManager.playNewOrder()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Testar campainha de novo pedido da cozinha"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Testar Alerta Sonoro</span>
          </button>

          <button
            onClick={() => setShowDelivered(!showDelivered)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showDelivered
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{showDelivered ? 'Ocultar Histórico' : 'Ver Entregues'}</span>
          </button>
        </div>

      </div>

      {/* 3 or 4 Kanban Columns */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${showDelivered ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-4 items-start`}>
        
        {/* Column 1: Na Fila (Queued) */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col overflow-hidden min-h-[500px]">
          <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                1. Na Fila (Novos)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono text-xs font-bold">
              {queuedOrders.length}
            </span>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
            {queuedOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-600 space-y-1">
                <p className="text-xs font-medium">Nenhum pedido aguardando.</p>
                <p className="text-[11px]">Novos pedidos aparecerão aqui em tempo real.</p>
              </div>
            ) : (
              queuedOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPrintReceipt={o => setReceiptOrder(o)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Na Chapa (Preparing) */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col overflow-hidden min-h-[500px]">
          <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                2. Na Chapa / Preparo
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 font-mono text-xs font-bold">
              {preparingOrders.length}
            </span>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
            {preparingOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-600 space-y-1">
                <p className="text-xs font-medium">Chapa livre.</p>
                <p className="text-[11px]">Inicie o preparo dos pedidos da fila.</p>
              </div>
            ) : (
              preparingOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPrintReceipt={o => setReceiptOrder(o)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Pronto para Retirada (Ready) */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col overflow-hidden min-h-[500px]">
          <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                3. Pronto para Retirada
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
              {readyOrders.length}
            </span>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
            {readyOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-600 space-y-1">
                <p className="text-xs font-medium">Nenhum pedido aguardando cliente.</p>
                <p className="text-[11px]">Marque os pedidos concluídos da chapa.</p>
              </div>
            ) : (
              readyOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPrintReceipt={o => setReceiptOrder(o)}
                />
              ))
            )}
          </div>
        </div>

        {/* Optional Column 4: Entregues / Concluídos Recentes */}
        {showDelivered && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col overflow-hidden min-h-[500px]">
            <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  4. Entregues Recentes
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono text-xs font-bold">
                {deliveredOrders.length}
              </span>
            </div>

            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
              {deliveredOrders.length === 0 ? (
                <div className="py-16 text-center text-slate-600 space-y-1">
                  <p className="text-xs font-medium">Nenhum pedido entregue ainda.</p>
                </div>
              ) : (
                deliveredOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onPrintReceipt={o => setReceiptOrder(o)}
                  />
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}

    </div>
  );
};
