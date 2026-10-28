import React, { useState } from 'react';
import { useFoodTruck } from '../../context/FoodTruckContext';
import { PaymentMethod, Order } from '../../types';
import { X, QrCode, CreditCard, Banknote, CheckCircle, Copy, Check, ArrowRight } from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const { cartSubtotal, checkoutOrder } = useFoodTruck();
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [discount, setDiscount] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<string>('');
  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const total = Math.max(0, cartSubtotal - discount);
  const numericCash = parseFloat(cashGiven.replace(',', '.')) || 0;
  const cashChange = numericCash >= total ? numericCash - total : 0;

  const pixKey = `00020126580014BR.GOV.BCB.PIX0136truckflow-${Date.now()}520400005303986540${total.toFixed(2)}5802BR5925TRUCKFLOW STREET FOOD6009SAO PAULO62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard?.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleFinalize = () => {
    if (method === 'cash' && numericCash < total && numericCash > 0) {
      // Allow exact if left blank, otherwise warn
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const actualCash = method === 'cash' ? (numericCash > 0 ? numericCash : total) : undefined;
      const order = checkoutOrder(method, actualCash, discount);
      setIsProcessing(false);
      onSuccess(order);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white">Finalizar Pagamento</h3>
            <p className="text-xs text-slate-400">Selecione o meio de pagamento e feche a conta</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Total Value Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Valor do Pedido</span>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                <span className="text-stone-400 text-base font-normal mr-1">R$</span>
                {total.toFixed(2).replace('.', ',')}
              </div>
            </div>
            {discount > 0 && (
              <span className="text-xs text-rose-400 font-mono">
                Desconto: -R$ {discount.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMethod('pix')}
                className={`py-3 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1.5 transition-all ${
                  method === 'pix'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span>PIX</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('credit')}
                className={`py-3 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1.5 transition-all ${
                  method === 'credit'
                    ? 'border-sky-500 bg-sky-500/15 text-sky-300 shadow-sm'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-sky-400" />
                <span>Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('debit')}
                className={`py-3 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1.5 transition-all ${
                  method === 'debit'
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-sm'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span>Débito</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`py-3 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1.5 transition-all ${
                  method === 'cash'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300 shadow-sm'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Banknote className="w-5 h-5 text-amber-400" />
                <span>Dinheiro</span>
              </button>
            </div>
          </div>

          {/* Method Details */}
          {method === 'pix' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 text-center">
              <div className="flex justify-center">
                {/* Visual SVG QR Code */}
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="white" />
                    {/* Corners */}
                    <path d="M10 10H35V35H10V10ZM15 15V30H30V15H15Z" fill="#0f172a" />
                    <rect x="19" y="19" width="7" height="7" fill="#0f172a" />
                    
                    <path d="M65 10H90V35H65V10ZM70 15V30H85V15H70Z" fill="#0f172a" />
                    <rect x="74" y="19" width="7" height="7" fill="#0f172a" />
                    
                    <path d="M10 65H35V90H10V65ZM15 70V85H30V70H15Z" fill="#0f172a" />
                    <rect x="19" y="74" width="7" height="7" fill="#0f172a" />

                    {/* Data grid representation */}
                    <rect x="42" y="10" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="10" width="6" height="6" fill="#0f172a" />
                    <rect x="42" y="20" width="6" height="12" fill="#0f172a" />
                    <rect x="52" y="24" width="6" height="8" fill="#0f172a" />
                    <rect x="10" y="42" width="10" height="6" fill="#0f172a" />
                    <rect x="25" y="42" width="10" height="6" fill="#0f172a" />
                    <rect x="42" y="42" width="16" height="16" fill="#059669" rx="2" />
                    <path d="M47 50L50 53L56 47" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <rect x="65" y="42" width="12" height="6" fill="#0f172a" />
                    <rect x="82" y="42" width="8" height="6" fill="#0f172a" />
                    <rect x="42" y="65" width="8" height="8" fill="#0f172a" />
                    <rect x="55" y="65" width="6" height="16" fill="#0f172a" />
                    <rect x="68" y="65" width="22" height="8" fill="#0f172a" />
                    <rect x="42" y="78" width="8" height="12" fill="#0f172a" />
                    <rect x="68" y="78" width="10" height="12" fill="#0f172a" />
                    <rect x="82" y="78" width="8" height="12" fill="#0f172a" />
                  </svg>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-300 font-medium">
                  Aponte a câmera do celular ou maquininha do cliente
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Chave aleatória gerada para o pedido
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyPix}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                {copiedPix ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPix ? 'Código Pix Copiado!' : 'Copiar Código Pix Copia-e-Cola'}</span>
              </button>
            </div>
          )}

          {method === 'cash' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Valor Entregue pelo Cliente (R$)
                </label>
                <input
                  type="text"
                  value={cashGiven}
                  onChange={e => setCashGiven(e.target.value)}
                  placeholder={`Ex: ${total.toFixed(2).replace('.', ',')}`}
                  className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-slate-700 text-lg font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Fast buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCashGiven(total.toFixed(2).replace('.', ','))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  Exato (R$ {total.toFixed(2).replace('.', ',')})
                </button>
                {[20, 50, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCashGiven(val.toFixed(2).replace('.', ','))}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-slate-200"
                  >
                    R$ {val},00
                  </button>
                ))}
              </div>

              {/* Troco Result */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Troco a Devolver:</span>
                <span className={`text-xl font-mono font-black ${cashChange > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  R$ {cashChange.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          )}

          {(method === 'credit' || method === 'debit') && (
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center space-y-2">
              <CreditCard className="w-8 h-8 text-sky-400 mx-auto" />
              <p className="text-sm font-semibold text-white">Insira ou Aproxime o Cartão no POS</p>
              <p className="text-xs text-slate-400">
                Aguardando confirmação na maquininha sem fio do Food Truck.
              </p>
            </div>
          )}

          {/* Desconto Opcional */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-400">Aplicar Desconto (R$)</span>
            <input
              type="number"
              min="0"
              max={cartSubtotal}
              step="1"
              value={discount || ''}
              onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0,00"
              className="w-24 h-9 px-2 text-right rounded-lg bg-slate-950 border border-slate-800 font-mono text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Voltar
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleFinalize}
            className="px-6 py-3 rounded-xl bg-[#A91D22] hover:bg-[#8e161c] text-white font-bold text-sm shadow-md shadow-red-950 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Processando...</span>
            ) : (
              <>
                <span>Confirmar & Enviar para Produção</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
