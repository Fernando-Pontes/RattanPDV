import React, { useState } from 'react';
import { Product, ExtraOption, OrderItemCustomization } from '../../types';
import { X, Check, Plus, AlertCircle, Sparkles } from 'lucide-react';

interface ProductCustomizeModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (quantity: number, customization: OrderItemCustomization) => void;
}

export const ProductCustomizeModal: React.FC<ProductCustomizeModalProps> = ({
  product,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [doneness, setDoneness] = useState<string | undefined>(
    product.allowedDoneness ? (product.allowedDoneness[0] as string) : undefined
  );
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([]);
  const [selectedRemovals, setSelectedRemovals] = useState<string[]>([]);
  const [customRemovalInput, setCustomRemovalInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Compute available removable ingredients
  const availableRemovals = React.useMemo(() => {
    return product.removableIngredients ? [...product.removableIngredients] : [];
  }, [product]);

  const toggleExtra = (extra: ExtraOption) => {
    setSelectedExtras(prev => {
      const exists = prev.some(e => e.id === extra.id);
      if (exists) {
        return prev.filter(e => e.id !== extra.id);
      }
      return [...prev, extra];
    });
  };

  const toggleRemoval = (ingredient: string) => {
    setSelectedRemovals(prev => {
      if (prev.includes(ingredient)) {
        return prev.filter(i => i !== ingredient);
      }
      return [...prev, ingredient];
    });
  };

  const extrasSum = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const unitPrice = product.price + extrasSum;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    onConfirm(quantity, {
      doneness: doneness as any,
      extras: selectedExtras.length > 0 ? selectedExtras : undefined,
      removals: selectedRemovals.length > 0 ? selectedRemovals : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const isRoll = product.category === 'cinnamon';
  const isEsmagatto = product.category === 'esmagatto';
  const isChips = product.category === 'chips';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-stone-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-stone-100">
        
        {/* Modal Header with Signature Crimson Line */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80 shrink-0">
          <div>
            <h3 className="font-display text-2xl font-bold tracking-wide text-white uppercase">
              {product.name}
            </h3>
            <p className="text-xs text-stone-400">
              {isRoll
                ? 'Escolha 1 recheio de base e personalize a cobertura'
                : isEsmagatto
                ? 'Sanduba de Foccacia de Levain artesanal · Personalize adições e remoções'
                : isChips
                ? 'Acompanhamento artesanal · Escolha o tempero da batata'
                : 'Personalize o pedido do cliente'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Base do Recheio / Variação / Tempero */}
          {product.allowedDoneness && product.allowedDoneness.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-sub text-xs font-bold uppercase tracking-wider text-red-400 block">
                  {isRoll
                    ? '1. Escolha o Recheio da Massa (Base)'
                    : isChips
                    ? 'Escolha o Tempero Especial'
                    : 'Opção / Variação'}
                </label>
                {isRoll && (
                  <span className="text-[10px] text-stone-400 uppercase font-mono">1 Incluso</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.allowedDoneness.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDoneness(item)}
                    className={`h-12 px-3.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between text-left ${
                      doneness === item
                        ? 'border-[#A91D22] bg-[#A91D22]/20 text-white shadow-sm'
                        : 'border-stone-800 bg-stone-950/60 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <span>{item}</span>
                    {doneness === item && <Check className="w-4 h-4 text-red-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Adicionais / Extras */}
          {product.allowedExtras && product.allowedExtras.length > 0 && (
            <div>
              <label className="font-sub text-xs font-bold uppercase tracking-wider text-red-400 block mb-2.5">
                {isRoll
                  ? '2. Coberturas Extras & Adicionais'
                  : isEsmagatto
                  ? 'Adicionais & Recheios Extras'
                  : 'Adicionais & Molhos para Mergulhar'}
              </label>
              <div className="space-y-2">
                {product.allowedExtras.map(extra => {
                  const isChecked = selectedExtras.some(e => e.id === extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra)}
                      className={`w-full h-12 px-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isChecked
                          ? 'border-[#A91D22] bg-[#A91D22]/15 text-white'
                          : 'border-stone-800 bg-stone-950/60 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            isChecked ? 'border-red-500 bg-[#A91D22] text-white' : 'border-stone-700'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-medium">{extra.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        + R$ {extra.price.toFixed(2).replace('.', ',')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Remoções / Exclusões */}
          {availableRemovals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-sub text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Remover Ingredientes</span>
                </label>
                <span className="text-[11px] text-stone-500">Toque para retirar</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availableRemovals.map(ingredient => {
                  const isRemoved = selectedRemovals.includes(ingredient);
                  return (
                    <button
                      key={ingredient}
                      type="button"
                      onClick={() => toggleRemoval(ingredient)}
                      className={`h-11 px-3 rounded-xl text-xs font-medium border flex items-center justify-between transition-all ${
                        isRemoved
                          ? 'border-rose-500/70 bg-rose-500/20 text-rose-300 font-bold shadow-sm'
                          : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      <span className="truncate">{ingredient}</span>
                      {isRemoved ? (
                        <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] text-stone-500 font-mono">Retirar</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Input para adicionar outra remoção personalizada */}
              <div className="mt-2.5 flex gap-1.5">
                <input
                  type="text"
                  value={customRemovalInput}
                  onChange={e => setCustomRemovalInput(e.target.value)}
                  placeholder="Outra remoção (ex: Sem Canela, Sem Açúcar)..."
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customRemovalInput.trim()) {
                      e.preventDefault();
                      const val = customRemovalInput.startsWith('Sem ')
                        ? customRemovalInput.trim()
                        : `Sem ${customRemovalInput.trim()}`;
                      if (!selectedRemovals.includes(val)) {
                        setSelectedRemovals(prev => [...prev, val]);
                      }
                      setCustomRemovalInput('');
                    }
                  }}
                  className="flex-1 h-9 px-3 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!customRemovalInput.trim()) return;
                    const val = customRemovalInput.startsWith('Sem ')
                      ? customRemovalInput.trim()
                      : `Sem ${customRemovalInput.trim()}`;
                    if (!selectedRemovals.includes(val)) {
                      setSelectedRemovals(prev => [...prev, val]);
                    }
                    setCustomRemovalInput('');
                  }}
                  className="px-3 h-9 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}

          {/* Observação Adicional */}
          <div>
            <label className="font-sub text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Observação para a Produção
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Aquecer por 15 segundos, embalar para presente..."
              className="w-full h-11 px-3.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Quantidade */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-800">
            <span className="text-sm font-medium text-stone-300">Quantidade</span>
            <div className="flex items-center gap-3 bg-stone-950 border border-stone-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-stone-800 text-stone-200 hover:bg-stone-700 flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="w-8 text-center font-mono font-bold text-base text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-stone-800 text-stone-200 hover:bg-stone-700 flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer with Green Price */}
        <div className="px-6 py-4 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-xs text-stone-400 block">Total do Item</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              <span className="text-stone-300 text-sm mr-1 font-normal">R$</span>
              {totalPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <button
            onClick={handleConfirm}
            className="px-6 py-3 bg-[#A91D22] hover:bg-[#8e161c] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-red-950 flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar ao Pedido</span>
          </button>
        </div>

      </div>
    </div>
  );
};
