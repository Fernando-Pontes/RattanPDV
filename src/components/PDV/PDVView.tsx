import React, { useState, useMemo } from 'react';
import { useFoodTruck } from '../../context/FoodTruckContext';
import { Product, CategoryId, Order } from '../../types';
import { ProductCustomizeModal } from './ProductCustomizeModal';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  ShoppingBag,
  DollarSign,
  Clock,
  LayoutGrid,
  ListFilter,
  FileText,
  X,
} from 'lucide-react';
import { MENU_ORIGINAL_CARD, MENU_LEVAIN_CARD } from '../../mockData';

export const PDVView: React.FC = () => {
  const {
    products,
    categories,
    cart,
    addToCart,
    updateCartItemQty,
    removeFromCart,
    clearCart,
    cartSubtotal,
    orderType,
    setOrderType,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    orderNotes,
    setOrderNotes,
    orders,
  } = useFoodTruck();

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [productToCustomize, setProductToCustomize] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [completedOrderForReceipt, setCompletedOrderForReceipt] = useState<Order | null>(null);
  const [displayLayout, setDisplayLayout] = useState<'menu-card' | 'grid'>('menu-card');
  const [isMenuCardOpen, setIsMenuCardOpen] = useState<boolean>(false);
  const [activeCardTab, setActiveCardTab] = useState<'levain' | 'cinnamon'>('levain');

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleProductClick = (product: Product) => {
    if (!product.available) return;
    if (product.hasCustomizations) {
      setProductToCustomize(product);
    } else {
      addToCart(product, 1);
    }
  };

  const nextSuggestedNumber = (orders.reduce((max, o) => Math.max(max, o.orderNumber || 0), 40) + 1);

  // Group items by category for the authentic Menu Card layout
  const groupedProducts = useMemo(() => {
    const map = new Map<string, Product[]>();
    categories.forEach(cat => {
      const prods = filteredProducts.filter(p => p.category === cat.id);
      if (prods.length > 0) {
        map.set(cat.id, prods);
      }
    });
    return map;
  }, [categories, filteredProducts]);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: 60% (7 of 12 columns on desktop) - Product Catalog */}
      <section className="lg:col-span-7 flex flex-col space-y-4">
        
        {/* Search & Layout View Controls */}
        <div className="space-y-3">
          
          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por roll, fatia, soda ou café..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-stone-900 border border-stone-800 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Action Buttons: Cardápio Impresso & Modo de Visualização */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsMenuCardOpen(true)}
                title="Visualizar a foto do cardápio físico impresso (Rattan Pães)"
                className="px-3 py-2 bg-stone-900 hover:bg-stone-800 hover:border-[#A91D22] border border-stone-800 text-stone-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <FileText className="w-4 h-4 text-[#A91D22]" />
                <span className="hidden sm:inline">Ver Cardápio Impresso</span>
                <span className="sm:hidden">Cardápio</span>
              </button>

              {/* Layout Toggle: Menu Card vs Photo Grid */}
              <div className="flex bg-stone-900 p-1 rounded-xl border border-stone-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setDisplayLayout('menu-card')}
                  title="Modo Cardápio Clássico (Identidade do Documento)"
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    displayLayout === 'menu-card'
                      ? 'bg-[#A91D22] text-white shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                  <span className="hidden sm:inline">Menu Documento</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayLayout('grid')}
                  title="Modo Grade com Fotos"
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    displayLayout === 'grid'
                      ? 'bg-[#A91D22] text-white shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Grade Fotos</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#A91D22] text-white shadow-sm font-bold'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              Todos os Itens
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#A91D22] text-white shadow-sm font-bold'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

        </div>

        {/* 1. AUTHENTIC MENU CARD LAYOUT (REPRODUCING THE DOCUMENT'S VISUAL IDENTITY) */}
        {displayLayout === 'menu-card' ? (
          <div className="space-y-6 bg-stone-900/90 border-2 border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl">
            {categories
              .filter(cat => selectedCategory === 'all' || selectedCategory === cat.id)
              .map(cat => {
                const catProducts = filteredProducts.filter(p => p.category === cat.id);
                if (catProducts.length === 0) return null;

                const isEsmagatto = cat.id === 'esmagatto';
                const isChips = cat.id === 'chips';
                const isCinnamon = cat.id === 'cinnamon';
                const isColdDrinks = cat.id === 'cold_drinks';
                const isHotDrinks = cat.id === 'hot_drinks';

                return (
                  <div key={cat.id} className="space-y-3">
                    
                    {/* Section Title in Deep Crimson with Signature Pin-Dot Divider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-[#c4252b] uppercase">
                          {isEsmagatto ? 'ESMAGATTO' : isChips ? 'CHIPS (ACOMPANHAMENTOS)' : cat.name}
                        </h3>
                      </div>

                      {/* Signature Pin-Dot Divider Line: Bar ending in solid circle */}
                      <div className="flex items-center gap-0">
                        <div className="h-[2px] bg-[#A91D22] flex-1"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#A91D22] shrink-0"></div>
                      </div>
                    </div>

                    {/* Sub-header Banner for Esmagatto (Sanduba de Foccacia Levain) */}
                    {isEsmagatto && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2 px-3 bg-stone-950/80 rounded-xl border border-stone-800 text-[10px] sm:text-xs font-sub font-bold uppercase text-stone-300 tracking-wider">
                        <span className="text-red-400 font-bold">(SANDUBA DE FOCCACIA DE FERMENTAÇÃO NATURAL)</span>
                        <span className="text-amber-400 font-mono text-[10px]">PRODUÇÃO ARTESANAL LIMITADA</span>
                      </div>
                    )}

                    {/* Sub-header Banner for Chips */}
                    {isChips && (
                      <div className="py-2 px-3 bg-stone-950/80 rounded-xl border border-stone-800 text-[10px] sm:text-xs font-sub font-bold uppercase text-stone-300 tracking-wider flex items-center justify-between">
                        <span className="text-amber-300 font-bold">BATATAS ARTESANAIS CROCANTES</span>
                        <span className="text-stone-400 font-mono text-[10px]">SELEÇÃO DA CASA</span>
                      </div>
                    )}

                    {/* Sub-header Banner from the Document for Cinnamon Roll */}
                    {isCinnamon && (
                      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-stone-950/80 rounded-xl border border-stone-800 text-[10px] sm:text-xs font-sub font-bold uppercase text-stone-300 text-center tracking-wider">
                        <div>RECHEADA COM AÇÚCAR E CANELA</div>
                        <div className="border-x border-stone-800">RECHEADA COM AÇÚCAR E COCO</div>
                        <div className="text-red-400">ESCOLHA 1 RECHEIO 1 COBERTURA</div>
                      </div>
                    )}

                    {isCinnamon && (
                      <div className="pt-1">
                        <span className="font-display text-sm font-bold tracking-widest text-red-500 uppercase block">
                          COBERTURAS
                        </span>
                      </div>
                    )}

                    {/* Items List with Authentic Dotted Leaders & Green Prices */}
                    <div className="space-y-2.5 pt-1">
                      {catProducts.map(product => {
                        return (
                          <div
                            key={product.id}
                            onClick={() => handleProductClick(product)}
                            role="button"
                            tabIndex={0}
                            className={`group p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              product.available
                                ? 'bg-stone-950/70 border-stone-800/90 hover:border-[#A91D22] hover:bg-stone-950 active:scale-[0.99]'
                                : 'bg-stone-950/40 border-stone-800/40 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {/* Left: Name and subtitle */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center font-display text-sm text-stone-300 group-hover:border-red-500 group-hover:text-red-400 shrink-0">
                                +
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <span className="font-sub text-base font-bold text-white uppercase group-hover:text-red-400 transition-colors">
                                    {isEsmagatto ? `*${product.name}` : product.name}
                                  </span>
                                </div>
                                <p className="text-[11px] text-stone-400 line-clamp-1">
                                  {product.description}
                                </p>
                              </div>
                            </div>

                            {/* Center: Dotted Leader Line (hidden on very small screens) */}
                            <div className="hidden md:block dotted-leader mx-2 shrink"></div>

                            {/* Right: Authentic Green Price & Quick Add Button */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-800/60">
                              <span className="font-mono text-base font-bold text-emerald-400">
                                <span className="text-stone-400 text-xs mr-1 font-normal">R$</span>
                                {product.price.toFixed(2).replace('.', ',')}
                              </span>

                              <button
                                type="button"
                                disabled={!product.available}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductClick(product);
                                }}
                                className="px-3 py-1 bg-stone-800 hover:bg-[#A91D22] text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                {product.hasCustomizations ? 'Escolher' : '+ Adicionar'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
          </div>
        ) : (
          /* 2. PHOTO GRID LAYOUT */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredProducts.map(product => {
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  role="button"
                  tabIndex={0}
                  className={`group text-left relative bg-stone-900 rounded-2xl border transition-all overflow-hidden flex flex-col cursor-pointer ${
                    product.available
                      ? 'border-stone-800 hover:border-red-500/70 hover:bg-stone-850 active:scale-[0.98]'
                      : 'border-stone-800/40 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="relative aspect-[4/3] w-full bg-stone-950 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!product.available && (
                      <div className="absolute inset-0 bg-stone-950/80 flex items-center justify-center p-2 text-center">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-sub">
                          Esgotado no Momento
                        </span>
                      </div>
                    )}
                    {product.available && (
                      <div className="absolute top-2.5 right-2.5 bg-stone-950/85 backdrop-blur-md px-2 py-0.5 rounded-lg border border-stone-800 text-[11px] font-mono text-stone-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-400" />
                        <span>~{product.prepTimeMinutes} min</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="font-sub text-base font-bold text-white uppercase group-hover:text-red-400 transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                      <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                        <span className="text-stone-400 text-xs mr-1 font-normal">R$</span>
                        {product.price.toFixed(2).replace('.', ',')}
                      </span>

                      <button
                        type="button"
                        disabled={!product.available}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        className="w-8 h-8 rounded-xl bg-stone-800 group-hover:bg-[#A91D22] text-stone-200 group-hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* RIGHT COLUMN: 40% (5 of 12 columns on desktop) - Comanda / Carrinho */}
      <section className="lg:col-span-5 sticky top-20 bg-stone-900 border-2 border-stone-800 rounded-3xl shadow-xl flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden">
        
        {/* Comanda Header with Brand Accent */}
        <div className="p-4 border-b border-stone-800 bg-stone-950/80 shrink-0 space-y-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white bg-[#A91D22] px-2.5 py-0.5 rounded-lg shadow-sm">
                SENHA #{nextSuggestedNumber}
              </span>
              <h3 className="font-display text-xl font-bold tracking-wide text-white uppercase">
                Comanda do Balcão
              </h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-stone-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="Limpar comanda"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          {/* Order Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-900 rounded-xl border border-stone-800">
            <button
              type="button"
              onClick={() => setOrderType('dine_in')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                orderType === 'dine_in'
                  ? 'bg-[#A91D22] text-white shadow-sm font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Consumir no Local</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('takeaway')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                orderType === 'takeaway'
                  ? 'bg-[#A91D22] text-white shadow-sm font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Para Viagem / Caixa</span>
            </button>
          </div>

          {/* Customer Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Nome do cliente (opcional)"
              className="h-9 px-3 rounded-lg bg-stone-900 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
            />
            <input
              type="text"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder="WhatsApp para aviso"
              className="h-9 px-3 rounded-lg bg-stone-900 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
            />
          </div>

        </div>

        {/* Items List (Scrollable) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 divide-y divide-stone-800">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-stone-500 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-stone-600 stroke-[1.5]" />
              <p className="text-sm font-medium font-sub">Nenhum item na comanda.</p>
              <p className="text-xs text-stone-500">Toque em qualquer Cinnamon Roll, soda ou café para adicionar.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="pt-3 first:pt-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="font-sub text-sm font-bold text-white uppercase">{item.name}</h5>
                    <div className="text-[11px] font-mono text-stone-400">
                      R$ {item.unitPrice.toFixed(2).replace('.', ',')} un
                    </div>
                  </div>

                  <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                    R$ {item.itemTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Customizations tags */}
                {(item.customization?.doneness ||
                  item.customization?.extras?.length ||
                  item.customization?.removals?.length ||
                  item.customization?.notes) && (
                  <div className="text-[11px] space-y-0.5 text-stone-400 pl-2 border-l border-red-900/60">
                    {item.customization?.doneness && (
                      <p className="text-red-300 font-medium">Base: {item.customization.doneness}</p>
                    )}
                    {item.customization?.extras?.map(e => (
                      <p key={e.id} className="text-stone-300">+ {e.name}</p>
                    ))}
                    {item.customization?.removals?.map(r => (
                      <p key={r} className="text-rose-400 font-medium">• {r}</p>
                    ))}
                    {item.customization?.notes && (
                      <p className="italic text-stone-400">Obs: {item.customization.notes}</p>
                    )}
                  </div>
                )}

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[10px] text-stone-500 hover:text-rose-400 transition-colors"
                  >
                    Excluir
                  </button>

                  <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartItemQty(item.id, -1)}
                      className="w-6 h-6 rounded bg-stone-800 text-stone-300 hover:bg-stone-700 flex items-center justify-center font-bold text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQty(item.id, 1)}
                      className="w-6 h-6 rounded bg-stone-800 text-stone-300 hover:bg-stone-700 flex items-center justify-center font-bold text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comanda Footer & Checkout Trigger */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 shrink-0 space-y-3">
          
          {/* Subtotal & Total with Green Price */}
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-stone-400 tracking-wider font-sub">Total da Comanda</span>
            <span className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
              <span className="text-stone-400 text-sm mr-1 font-normal">R$</span>
              {cartSubtotal.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Quick Order Note */}
          <input
            type="text"
            value={orderNotes}
            onChange={e => setOrderNotes(e.target.value)}
            placeholder="Observação da comanda (ex: cliente aguarda no bistrô)"
            className="w-full h-8 px-2.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
          />

          {/* Checkout Button in Brand Crimson */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full h-12 bg-[#A91D22] hover:bg-[#8e161c] disabled:opacity-40 disabled:pointer-events-none text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-950 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <DollarSign className="w-4 h-4 stroke-[3]" />
            <span className="font-sub tracking-wider text-base">Cobrar & Enviar para Produção</span>
          </button>

        </div>

      </section>

      {/* Modals */}
      {productToCustomize && (
        <ProductCustomizeModal
          product={productToCustomize}
          onClose={() => setProductToCustomize(null)}
          onConfirm={(qty, customization) => {
            addToCart(productToCustomize, qty, customization);
          }}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={(order) => {
            setIsCheckoutOpen(false);
            setCompletedOrderForReceipt(order);
          }}
        />
      )}

      {completedOrderForReceipt && (
        <ReceiptModal
          order={completedOrderForReceipt}
          onClose={() => setCompletedOrderForReceipt(null)}
        />
      )}

      {/* Modal Cardápio Impresso Oficial */}
      {isMenuCardOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-stone-800 flex items-center justify-between bg-stone-950 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#A91D22]/20 border border-[#A91D22]/30 flex items-center justify-center text-[#A91D22]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Cardápios Impressos Oficiais</h3>
                  <p className="text-[11px] text-stone-400">Documentos de referência da Rattan Pães</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuCardOpen(false)}
                className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector between Cardápio 1 (Sandubas Levain) and Cardápio 2 (Cinnamon Roll & Bebidas) */}
            <div className="flex border-b border-stone-800 bg-stone-950/90 px-3 pt-2 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveCardTab('levain')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeCardTab === 'levain'
                    ? 'border-[#A91D22] text-white'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>1. Sandubas Levain & Chips</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCardTab('cinnamon')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeCardTab === 'cinnamon'
                    ? 'border-[#A91D22] text-white'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>2. Cinnamon Roll & Cafeteria</span>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-stone-950/50">
              <img
                src={activeCardTab === 'levain' ? MENU_LEVAIN_CARD : MENU_ORIGINAL_CARD}
                alt={activeCardTab === 'levain' ? 'Cardápio Sandubas Esmagatto Levain' : 'Cardápio Cinnamon Roll Rattan Pães'}
                className="max-h-[64vh] w-auto rounded-xl shadow-lg border border-stone-800 object-contain bg-white"
              />
              <p className="text-xs text-stone-400 mt-3 text-center">
                {activeCardTab === 'levain'
                  ? 'Esmagatto (Foccacia de Levain) & Batata Chips artesanal'
                  : 'Cinnamon Roll / Fatia Húngara, Bebidas Frias e Quentes'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
