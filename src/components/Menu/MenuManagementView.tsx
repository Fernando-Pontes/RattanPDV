import React, { useState, useRef } from 'react';
import { useFoodTruck } from '../../context/FoodTruckContext';
import { Product, CategoryId } from '../../types';
import { IMAGES, MENU_ORIGINAL_CARD, MENU_LEVAIN_CARD } from '../../mockData';
import {
  Plus,
  Check,
  Edit2,
  FolderTree,
  X,
  Trash2,
  Tag,
  Upload,
  Image as ImageIcon,
  Link,
  Camera,
  RefreshCw,
  FileText,
} from 'lucide-react';

export const MenuManagementView: React.FC = () => {
  const {
    products,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleProductAvailability,
    updateProductPrice,
    updateProductImage,
    addProduct,
  } = useFoodTruck();

  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState<boolean>(false);
  const [isOriginalCardOpen, setIsOriginalCardOpen] = useState<boolean>(false);
  const [activeCardTab, setActiveCardTab] = useState<'levain' | 'cinnamon'>('levain');
  const [editingImageProduct, setEditingImageProduct] = useState<Product | null>(null);

  // Form for new item
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>(categories[0]?.id || 'burgers');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newPrepTime, setNewPrepTime] = useState<string>('8');
  
  // Image handling for new item
  const [newImage, setNewImage] = useState<string>(IMAGES.burger);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'gallery' | 'url'>('gallery');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Category management modal state
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<string>('');

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleStartEditPrice = (product: Product) => {
    setEditingPriceId(product.id);
    setTempPrice(product.price.toString());
  };

  const handleSavePrice = (productId: string) => {
    const parsed = parseFloat(tempPrice.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      updateProductPrice(productId, parsed);
    }
    setEditingPriceId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditingExisting = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read as Base64 Data URL for persistent local storage & offline preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (isEditingExisting && editingImageProduct) {
        updateProductImage(editingImageProduct.id, result);
        setEditingImageProduct(null);
      } else {
        setNewImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newPrice.replace(',', '.'));
    if (!newName.trim() || isNaN(parsed) || parsed <= 0) return;

    let chosenImage = newImage;
    if (imageInputMode === 'url' && customImageUrl.trim()) {
      chosenImage = customImageUrl.trim();
    }

    const isRoll = newCategory.includes('cinnamon') || newCategory.includes('roll') || newCategory.includes('fatia');

    addProduct({
      name: newName.trim(),
      category: newCategory,
      price: parsed,
      description: newDescription.trim() || 'Item artesanal preparado na hora.',
      image: chosenImage,
      available: true,
      prepTimeMinutes: parseInt(newPrepTime) || 4,
      hasCustomizations: isRoll,
      allowedDoneness: isRoll ? ['Açúcar e Canela', 'Açúcar e Coco'] : undefined,
      removableIngredients: isRoll ? ['Sem Canela', 'Sem Coco', 'Menos Glacê'] : undefined,
    });

    // Reset form
    setNewName('');
    setNewPrice('');
    setNewDescription('');
    setNewImage(IMAGES.cinnamonRoll);
    setCustomImageUrl('');
    setIsAddModalOpen(false);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const handleSaveCategoryName = (id: string) => {
    if (!editingCategoryName.trim()) return;
    updateCategory(id, editingCategoryName.trim());
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const galleryPresets = [
    { label: 'Esmagatto (Foccacia Levain)', url: IMAGES.esmagatto },
    { label: 'Batata Chips Artesanal', url: IMAGES.chips },
    { label: 'Cinnamon Roll / Fatia', url: IMAGES.cinnamonRoll },
    { label: 'Box Degustação', url: IMAGES.box },
    { label: 'Bebidas Frias / Soda', url: IMAGES.coldDrink },
    { label: 'Cafeteria & Quentes', url: IMAGES.hotCoffee },
    { label: 'Cardápio Levain', url: IMAGES.levainCard },
    { label: 'Cardápio Cinnamon', url: IMAGES.originalCard },
  ];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Cardápio & Controle de Estoque</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Gerencie itens, fotos, categorias e disponibilidade imediata para o caixa.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Ver Cardápio Impresso Button */}
          <button
            type="button"
            onClick={() => setIsOriginalCardOpen(true)}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-[#A91D22] text-slate-200 hover:text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <FileText className="w-4 h-4 text-[#A91D22]" />
            <span>Cardápio Impresso</span>
          </button>

          {/* Gerenciar Categorias Button */}
          <button
            onClick={() => setIsCategoriesModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <FolderTree className="w-4 h-4 text-amber-400" />
            <span>Gerenciar Categorias</span>
          </button>

          {/* Novo Item Button */}
          <button
            onClick={() => {
              // Set initial image according to current category
              if (activeCategory === 'portions') setNewImage(IMAGES.fries);
              else if (activeCategory === 'drinks') setNewImage(IMAGES.drink);
              else if (activeCategory === 'desserts') setNewImage(IMAGES.dessert);
              else setNewImage(IMAGES.burger);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Item no Cardápio</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Todos ({products.length})
        </button>
        {categories.map(cat => {
          const count = products.filter(p => p.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}

        <button
          onClick={() => setIsCategoriesModalOpen(true)}
          className="px-2.5 py-1.5 rounded-xl border border-dashed border-slate-700 hover:border-amber-400 text-slate-400 hover:text-amber-400 text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
          title="Adicionar ou editar categorias"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Editar Categorias</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Foto & Produto</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Tempo Preparo</th>
                <th className="py-3.5 px-4">Preço (R$)</th>
                <th className="py-3.5 px-4 text-center">Status / Disponível</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map(product => {
                const catObj = categories.find(c => c.id === product.category);
                return (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Product Name & Photo with Change Picture Click */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setEditingImageProduct(product)}
                          className="relative group cursor-pointer shrink-0"
                          title="Clique para alterar a foto deste produto"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 group-hover:border-amber-400 transition-all"
                          />
                          <div className="absolute inset-0 bg-slate-950/70 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-amber-400">
                            <Camera className="w-4 h-4" />
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-white text-sm block">
                            {product.name}
                          </span>
                          <span className="text-slate-400 line-clamp-1 max-w-xs text-[11px]">
                            {product.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-300 font-medium whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 text-slate-200">
                        {catObj?.name || product.category}
                      </span>
                    </td>

                    {/* Prep time */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      ~{product.prepTimeMinutes} min
                    </td>

                    {/* Price with Inline Edit */}
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      {editingPriceId === product.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={tempPrice}
                            onChange={e => setTempPrice(e.target.value)}
                            className="w-20 h-7 px-2 bg-slate-950 border border-amber-400 rounded text-amber-300 text-xs font-mono font-bold focus:outline-none"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSavePrice(product.id)}
                          />
                          <button
                            onClick={() => handleSavePrice(product.id)}
                            className="p-1 rounded bg-amber-400 text-slate-950 hover:bg-amber-300"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditPrice(product)}
                          className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold group"
                          title="Clique para editar o preço"
                        >
                          <span>R$ {product.price.toFixed(2).replace('.', ',')}</span>
                          <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                        </button>
                      )}
                    </td>

                    {/* Availability Toggle */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleProductAvailability(product.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          product.available
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${product.available ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <span>{product.available ? 'Disponível' : 'Esgotado'}</span>
                      </button>
                    </td>

                    {/* Fast Toggle Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => toggleProductAvailability(product.id)}
                        className="text-xs text-slate-400 hover:text-white underline font-medium"
                      >
                        {product.available ? 'Pausar Vendas' : 'Ativar Item'}
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CADASTRAR NOVO PRODUTO COM IMAGEM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Cadastrar Item no Cardápio</h3>
                <p className="text-xs text-slate-400">Adicione foto, categoria, valores e descrição do prato.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              
              {/* IMAGE SELECTION SECTION */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>Imagem do Produto</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Formatos: JPG, PNG, WEBP</span>
                </div>

                {/* Live Preview Container */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-36 h-28 rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-900 shrink-0 shadow-inner group">
                    <img
                      src={imageInputMode === 'url' && customImageUrl ? customImageUrl : newImage}
                      alt="Pré-visualização"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = IMAGES.burger;
                      }}
                    />
                    <div className="absolute bottom-1 right-1 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-300">
                      Prévia
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {/* Method Selector Tabs */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('upload')}
                        className={`py-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
                          imageInputMode === 'upload' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>Do Aparelho</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('gallery')}
                        className={`py-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
                          imageInputMode === 'gallery' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Galeria</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('url')}
                        className={`py-1.5 rounded-md flex items-center justify-center gap-1 transition-all ${
                          imageInputMode === 'url' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Link className="w-3 h-3" />
                        <span>Link URL</span>
                      </button>
                    </div>

                    {/* Mode 1: Upload from device */}
                    {imageInputMode === 'upload' && (
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={e => handleFileUpload(e, false)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-2.5 px-3 rounded-lg border border-dashed border-amber-400/60 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Selecionar Foto ou Tirar com Câmera</span>
                        </button>
                      </div>
                    )}

                    {/* Mode 2: Gallery Presets */}
                    {imageInputMode === 'gallery' && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {galleryPresets.map(preset => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setNewImage(preset.url)}
                            className={`p-1.5 rounded-lg border text-left text-[11px] font-medium flex items-center gap-2 transition-all ${
                              newImage === preset.url
                                ? 'border-amber-400 bg-amber-400/15 text-white'
                                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <img src={preset.url} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                            <span className="truncate">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Mode 3: Link URL */}
                    {imageInputMode === 'url' && (
                      <div className="space-y-1">
                        <input
                          type="url"
                          value={customImageUrl}
                          onChange={e => setCustomImageUrl(e.target.value)}
                          placeholder="Cole o link da foto (https://...)"
                          className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PRODUCT NAME */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Nome do Item</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Double Cheddar Especial"
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* CATEGORY & PRICE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Categoria</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setIsCategoriesModalOpen(true);
                      }}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      + Criar Nova
                    </button>
                  </div>
                  <select
                    value={newCategory}
                    onChange={e => {
                      const cat = e.target.value;
                      setNewCategory(cat);
                      // Auto-suggest image if not customized yet
                      if (cat.includes('portion') || cat.includes('frita')) setNewImage(IMAGES.fries);
                      else if (cat.includes('drink') || cat.includes('bebida') || cat.includes('chopp')) setNewImage(IMAGES.drink);
                      else if (cat.includes('dessert') || cat.includes('sobremesa')) setNewImage(IMAGES.dessert);
                      else if (cat.includes('burger')) setNewImage(IMAGES.burger);
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Preço (R$)</label>
                  <input
                    type="text"
                    required
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    placeholder="34,90"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* PREP TIME & DESCRIPTION */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Tempo (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={newPrepTime}
                    onChange={e => setNewPrepTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Descrição</label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="Ingredientes e detalhes do prato..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/10"
                >
                  Salvar Item com Imagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ALTERAR IMAGEM DE PRODUTO EXISTENTE */}
      {editingImageProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Alterar Foto</h3>
                <p className="text-xs text-slate-400">{editingImageProduct.name}</p>
              </div>
              <button
                onClick={() => setEditingImageProduct(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center">
              <img
                src={editingImageProduct.image}
                alt={editingImageProduct.name}
                className="w-36 h-28 rounded-xl object-cover border-2 border-slate-700 shadow-lg"
              />
            </div>

            <div className="space-y-2">
              <input
                type="file"
                ref={editFileInputRef}
                accept="image/*"
                onChange={e => handleFileUpload(e, true)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => editFileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Carregar Nova Foto do Aparelho</span>
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-500 block mb-1.5">Ou escolha uma foto da galeria:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {galleryPresets.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        updateProductImage(editingImageProduct.id, preset.url);
                        setEditingImageProduct(null);
                      }}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:border-amber-400 text-[10px] font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <img src={preset.url} alt="" className="w-5 h-5 rounded object-cover" />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: GERENCIAR CATEGORIAS */}
      {isCategoriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[85vh]">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Gerenciar Categorias</h3>
                  <p className="text-xs text-slate-400">Adicione, renomeie ou exclua as categorias do cardápio</p>
                </div>
              </div>
              <button
                onClick={() => setIsCategoriesModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nova Categoria Form */}
            <form onSubmit={handleAddCategorySubmit} className="pt-4 pb-3 border-b border-slate-800 flex gap-2 shrink-0">
              <input
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Ex: Sucos Naturais, Hot Dogs, Tacos..."
                className="flex-1 h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!newCategoryName.trim()}
                className="px-4 h-10 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Adicionar</span>
              </button>
            </form>

            {/* Categories List */}
            <div className="py-4 space-y-2.5 overflow-y-auto flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Categorias Atuais ({categories.length})
              </span>

              {categories.map(cat => {
                const isEditing = editingCategoryId === cat.id;
                const productsInCat = products.filter(p => p.category === cat.id).length;

                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={e => setEditingCategoryName(e.target.value)}
                          className="flex-1 h-8 px-2.5 bg-slate-900 border border-amber-400 rounded-lg text-xs text-white focus:outline-none font-medium"
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && handleSaveCategoryName(cat.id)}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveCategoryName(cat.id)}
                          className="px-2.5 py-1.5 bg-amber-400 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-300"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategoryId(null)}
                          className="px-2 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {cat.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {productsInCat} produto(s) associado(s)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setEditingCategoryName(cat.name);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                            title="Renomear categoria"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {categories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Deseja excluir a categoria "${cat.name}"? Os produtos vinculados serão movidos para outra categoria.`)) {
                                  deleteCategory(cat.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400"
                              title="Excluir categoria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsCategoriesModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Concluído
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Cardápio Impresso Oficial */}
      {isOriginalCardOpen && (
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
                onClick={() => setIsOriginalCardOpen(false)}
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
