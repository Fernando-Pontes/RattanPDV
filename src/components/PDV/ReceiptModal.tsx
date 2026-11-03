import React from 'react';
import { Order } from '../../types';
import { Printer, X, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Top actions */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pedido Enviado para a Cozinha!</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 80mm Thermal Receipt Preview Card */}
        <div className="p-4 overflow-y-auto bg-slate-950">
          <div
            id="thermal-receipt"
            className="bg-amber-50/95 text-slate-900 p-5 rounded-lg shadow-inner font-mono text-xs leading-relaxed border-t-4 border-amber-400/80"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              <h2 className="text-base font-black tracking-tight uppercase">RATTAN PÃES</h2>
              <p className="text-[10px] text-slate-600">Cinnamon Roll · Fatia Húngara · Cafeteria</p>
              <p className="text-[9px] text-slate-500 mt-0.5">CNPJ: 34.567.890/0001-23</p>
              <p className="text-[10px] text-slate-600 mt-1">{formattedDate}</p>
            </div>

            {/* Giant Order Number */}
            <div className="text-center py-3 border-b border-dashed border-slate-400">
              <span className="text-[11px] font-bold text-slate-600 block uppercase">Comanda / Senha</span>
              <span className="text-3xl font-black tracking-tight text-slate-950 block">
                #{order.orderNumber}
              </span>
              <div className="mt-1 flex items-center justify-center gap-2 text-[10px] font-bold">
                <span className="px-1.5 py-0.5 bg-slate-200 rounded">
                  {order.orderType === 'dine_in' ? 'COMER NO LOCAL' : 'PARA VIAGEM'}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-bold text-slate-800">
                Cliente: {order.customerName}
              </p>
              {order.notes && (
                <p className="mt-1 text-[10px] italic text-slate-700 bg-slate-100 p-1 rounded text-center">
                  Obs Comanda: {order.notes}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
              <div className="flex justify-between font-bold text-[10px] text-slate-600 pb-1 border-b border-slate-300">
                <span>QTD ITEM</span>
                <span>TOTAL</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {item.itemTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {item.customization?.doneness && (
                    <p className="text-[10px] text-slate-600 pl-4">
                      • Ponto: {item.customization.doneness}
                    </p>
                  )}
                  {item.customization?.extras?.map(e => (
                    <p key={e.id} className="text-[10px] text-slate-600 pl-4">
                      + {e.name} (R$ {e.price.toFixed(2).replace('.', ',')})
                    </p>
                  ))}
                  {item.customization?.removals?.map(r => (
                    <p key={r} className="text-[10px] text-rose-700 font-bold pl-4">
                      • {r}
                    </p>
                  ))}
                  {item.customization?.notes && (
                    <p className="text-[10px] italic text-slate-600 pl-4">
                      Obs: {item.customization.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal</span>
                <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>Desconto</span>
                  <span>- R$ {order.discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-300 text-slate-950">
                <span>TOTAL PAGO</span>
                <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 text-slate-600 uppercase">
                <span>Forma de Pagto:</span>
                <span className="font-bold text-slate-900">{order.paymentMethod.toUpperCase()}</span>
              </div>
              {order.cashReceived && (
                <>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Valor Recebido:</span>
                    <span>R$ {order.cashReceived.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-900">
                    <span>Troco:</span>
                    <span>R$ {(order.cashChange || 0).toFixed(2).replace('.', ',')}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 text-center space-y-1 text-[10px] text-slate-600">
              <p className="font-bold text-slate-800">Acompanhe seu pedido no painel de chamada!</p>
              <p>Obrigado pela preferência e bom apetite!</p>
              <p className="text-[8px] text-slate-400 pt-1 font-mono">TruckFlow Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comanda (80mm)</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
