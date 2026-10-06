import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  AlertOctagon,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  Layers,
  Building,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  RefreshCw,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { Material } from '../../types';
import { getTodayDateString } from '../../utils/initialData';
import { BudgetAlertBanner } from '../common/BudgetAlertBanner';
import { getTranslation } from '../../utils/translations';

export const MaterialsView: React.FC = () => {
  const {
    materials,
    materialTransactions,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addMaterialStock,
    useMaterialStock,
    totalStockValue,
    lowStockMaterialsCount,
    outOfStockMaterialsCount,
    projects,
    currentProjectId,
    settings,
    remainingBudget,
    budget,
  } = useWorkmate();

  const t = getTranslation(settings.language || 'en');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTabSub, setActiveTabSub] = useState<'inventory' | 'activity'>('inventory');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMatForStock, setSelectedMatForStock] = useState<Material | null>(null);
  const [selectedMatForUsage, setSelectedMatForUsage] = useState<Material | null>(null);

  // Add material form
  const [formData, setFormData] = useState({
    name: '',
    category: 'Masonry & Concrete',
    unit: 'Bags',
    openingStock: 100,
    minStockLevel: 25,
    purchasePrice: 15,
    supplier: '',
    purchaseDate: getTodayDateString(),
    projectId: currentProjectId !== 'all' ? currentProjectId : 'proj-1',
    notes: '',
    autoCreateExpense: true,
  });

  // Stock Add form
  const [stockAddQty, setStockAddQty] = useState<number | ''>(50);
  const [stockAddPrice, setStockAddPrice] = useState<number | ''>('');
  const [stockAddAutoExpense, setStockAddAutoExpense] = useState(true);
  const [stockAddNotes, setStockAddNotes] = useState('');
  const [stockAddError, setStockAddError] = useState<string | null>(null);

  // Stock Use form
  const [usageQty, setUsageQty] = useState<number | ''>(10);
  const [usageWorker, setUsageWorker] = useState('Carlos Mendez (Mason)');
  const [usageNotes, setUsageNotes] = useState('');
  const [usageError, setUsageError] = useState<string | null>(null);

  const categories = [
    'Masonry & Concrete',
    'Structural Steel',
    'Aggregates',
    'Carpentry & Wood',
    'Plumbing & Pipes',
    'Electrical',
    'Finishing & Paint',
    'Tools & Hardware',
    'Fuel & Lubricants',
    'Other',
  ];

  const units = ['Bags', 'Tons', 'Sq.ft', 'Meters', 'Pcs', 'Liters', 'Kg', 'Boxes'];

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'all' || m.category === categoryFilter;
      const matchesProj = currentProjectId === 'all' || m.projectId === currentProjectId;
      return matchesSearch && matchesCat && matchesProj;
    });
  }, [materials, searchQuery, categoryFilter, currentProjectId]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Masonry & Concrete',
      unit: 'Bags',
      openingStock: 100,
      minStockLevel: 25,
      purchasePrice: 15,
      supplier: 'Metro Materials Depot',
      purchaseDate: getTodayDateString(),
      projectId: currentProjectId !== 'all' ? currentProjectId : 'proj-1',
      notes: '',
      autoCreateExpense: true,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveNewMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addMaterial({
      name: formData.name.trim(),
      category: formData.category,
      unit: formData.unit,
      openingStock: Number(formData.openingStock) || 0,
      addedStock: 0,
      usedStock: 0,
      quantity: Number(formData.openingStock) || 0,
      minStockLevel: Number(formData.minStockLevel) || 10,
      purchasePrice: Number(formData.purchasePrice) || 0,
      supplier: formData.supplier.trim() || 'General Supplier',
      purchaseDate: formData.purchaseDate,
      projectId: formData.projectId,
      notes: formData.notes.trim() || undefined,
    }, formData.autoCreateExpense);

    setIsAddModalOpen(false);
  };

  const handleExecuteStockAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatForStock || !stockAddQty || Number(stockAddQty) <= 0) return;

    const res = addMaterialStock(
      selectedMatForStock.id,
      Number(stockAddQty),
      stockAddPrice !== '' ? Number(stockAddPrice) : undefined,
      stockAddAutoExpense,
      stockAddNotes
    );

    if (!res.success) {
      setStockAddError(res.error || 'Failed to add stock.');
      return;
    }

    setSelectedMatForStock(null);
  };

  const handleExecuteStockUse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatForUsage || !usageQty || Number(usageQty) <= 0) return;

    const res = useMaterialStock(
      selectedMatForUsage.id,
      Number(usageQty),
      usageWorker,
      usageNotes
    );

    if (!res.success) {
      setUsageError(res.error || 'Failed to use stock.');
      return;
    }

    setSelectedMatForUsage(null);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      <BudgetAlertBanner />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            Material & Inventory Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track site stock, automatic usage calculations, and purchase expenses
          </p>
        </div>

        <div className="flex items-center space-x-2 self-stretch sm:self-auto">
          {/* Sub Tab Switcher */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl text-xs">
            <button
              onClick={() => setActiveTabSub('inventory')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeTabSub === 'inventory'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inventory ({materials.length})
            </button>
            <button
              onClick={() => setActiveTabSub('activity')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeTabSub === 'activity'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Activity Log ({materialTransactions.length})
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Material</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Materials Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-slate-400 block text-[11px]">Total Stock Value</span>
          <span className="text-xl font-black text-white mt-1 block">
            <span className="text-amber-400 mr-0.5">{settings.currencySymbol}</span>
            {Math.round(totalStockValue).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500">{materials.length} items cataloged</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-slate-400 block text-[11px]">Low Stock Items</span>
          <span className="text-xl font-black text-amber-400 mt-1 block flex items-center gap-1.5">
            {lowStockMaterialsCount > 0 && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {lowStockMaterialsCount}
          </span>
          <span className="text-[10px] text-slate-500">Below minimum buffer</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-slate-400 block text-[11px]">Out of Stock</span>
          <span className="text-xl font-black text-rose-400 mt-1 block flex items-center gap-1.5">
            {outOfStockMaterialsCount > 0 && <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />}
            {outOfStockMaterialsCount}
          </span>
          <span className="text-[10px] text-slate-500">Needs immediate reorder</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-slate-400 block text-[11px]">Stock Movements</span>
          <span className="text-xl font-black text-cyan-400 mt-1 block">
            {materialTransactions.length}
          </span>
          <span className="text-[10px] text-slate-500">Logged issues & receipts</span>
        </div>
      </div>

      {activeTabSub === 'inventory' ? (
        <>
          {/* Search and Category Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search materials by name, supplier or category..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                  categoryFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Categories ({materials.length})
              </button>
              {categories.map(c => {
                const count = materials.filter(m => m.category === c).length;
                if (count === 0) return null;
                return (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                      categoryFilter === c
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Materials Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
              <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <div className="font-bold text-white text-sm">No materials matching criteria</div>
              <p className="mt-1">Tap "Add Material" to register inventory supplies.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredMaterials.map(mat => {
                const isOutOfStock = mat.quantity <= 0;
                const isLowStock = !isOutOfStock && mat.quantity <= mat.minStockLevel;
                const stockVal = mat.quantity * (mat.purchasePrice || 0);

                return (
                  <div
                    key={mat.id}
                    className={`bg-slate-900 border rounded-2xl p-4 transition-all shadow-sm flex flex-col justify-between ${
                      isOutOfStock
                        ? 'border-red-500/50 bg-red-950/20'
                        : isLowStock
                        ? 'border-amber-500/50 bg-amber-950/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-extrabold text-sm sm:text-base text-white">
                              {mat.name}
                            </h3>
                            {isOutOfStock && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500 text-white animate-pulse">
                                Out of Stock
                              </span>
                            )}
                            {isLowStock && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-slate-950">
                                Low Stock
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="text-amber-400 font-semibold">{mat.category}</span>
                            <span>•</span>
                            <span>{mat.supplier}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm(`Remove material ${mat.name}?`)) {
                              deleteMaterial(mat.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition"
                          title="Delete material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Stock Quantity Highlight Bar */}
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Remaining</span>
                          <span
                            className={`text-lg font-black block mt-0.5 ${
                              isOutOfStock
                                ? 'text-red-400'
                                : isLowStock
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {mat.quantity} <span className="text-[11px] font-normal">{mat.unit}</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Min Threshold</span>
                          <span className="text-sm font-bold text-slate-300 block mt-1">
                            {mat.minStockLevel} {mat.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Total Value</span>
                          <span className="text-sm font-bold text-white block mt-1">
                            {settings.currencySymbol}{Math.round(stockVal).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Formula & Breakdown strip */}
                      <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Formula: {mat.openingStock} open + {mat.addedStock} added - {mat.usedStock} used</span>
                        <span className="text-slate-300 font-medium">
                          @{settings.currencySymbol}{mat.purchasePrice}/{mat.unit}
                        </span>
                      </div>
                    </div>

                    {/* Stock Operations Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMatForStock(mat);
                          setStockAddQty(50);
                          setStockAddPrice(mat.purchasePrice);
                          setStockAddAutoExpense(true);
                          setStockAddNotes('Stock replenishment delivery');
                          setStockAddError(null);
                        }}
                        className="flex-1 py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add Stock</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedMatForUsage(mat);
                          setUsageQty(Math.min(10, mat.quantity));
                          setUsageWorker('Carlos Mendez (Mason)');
                          setUsageNotes('Issued for site work');
                          setUsageError(null);
                        }}
                        disabled={mat.quantity <= 0}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition ${
                          mat.quantity <= 0
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Use / Issue</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Material Activity History View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="font-bold text-sm text-white">Stock Movement Log</h3>
            <span className="text-xs text-slate-400">{materialTransactions.length} transactions recorded</span>
          </div>

          {materialTransactions.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No material transactions logged yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {materialTransactions.map(tx => (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          tx.type === 'add'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {tx.type === 'add' ? '+ Received' : '- Issued'}
                      </span>
                      <span className="font-bold text-white truncate">{tx.materialName}</span>
                    </div>

                    <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span>By: {tx.performedBy}</span>
                      {tx.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-500 truncate">{tx.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-black text-sm ${
                        tx.type === 'add' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {tx.type === 'add' ? '+' : '-'}{tx.quantity} {tx.unit}
                    </div>
                    {tx.expenseCreated && (
                      <span className="text-[10px] text-rose-400 font-semibold block">
                        Deducted from budget
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add New Material Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Register New Material</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewMaterial} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Material Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Portland Cement, Sand, Steel Rebars 12mm"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Unit of Measure
                  </label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {units.map(u => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Opening Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.openingStock}
                    onChange={e => setFormData({ ...formData, openingStock: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Min Alert Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockLevel}
                    onChange={e => setFormData({ ...formData, minStockLevel: Number(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Price / Unit ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.purchasePrice}
                    onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Supplier / Depot
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="e.g. Apex Depot"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Project / Site
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Automatic Expense Connection Checkbox */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Auto-Record in Expenses & Budget</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Total: {settings.currencySymbol}{(formData.openingStock * formData.purchasePrice).toLocaleString()} deducted from project budget
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoCreateExpense}
                  onChange={e => setFormData({ ...formData, autoCreateExpense: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {selectedMatForStock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Receive / Add Stock</h3>
              </div>
              <button onClick={() => setSelectedMatForStock(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {stockAddError && (
              <div className="mt-3 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                {stockAddError}
              </div>
            )}

            <form onSubmit={handleExecuteStockAdd} className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-slate-400">Material:</div>
                <div className="font-bold text-sm text-white">{selectedMatForStock.name}</div>
                <div className="text-[11px] text-amber-400">Current Stock: {selectedMatForStock.quantity} {selectedMatForStock.unit}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Quantity ({selectedMatForStock.unit}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={stockAddQty}
                    onChange={e => setStockAddQty(Number(e.target.value) || '')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-extrabold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Rate ({settings.currencySymbol}/{selectedMatForStock.unit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={stockAddPrice}
                    onChange={e => setStockAddPrice(Number(e.target.value) || '')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              {/* Auto expense checkbox */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Deduct from Budget</span>
                  <span className="text-[10px] text-slate-400">
                    Total: {settings.currencySymbol}{((Number(stockAddQty) || 0) * (Number(stockAddPrice) || selectedMatForStock.purchasePrice)).toLocaleString()}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={stockAddAutoExpense}
                  onChange={e => setStockAddAutoExpense(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Delivery Notes / Delivery Challan
                </label>
                <input
                  type="text"
                  value={stockAddNotes}
                  onChange={e => setStockAddNotes(e.target.value)}
                  placeholder="e.g. Challan #9982 from depot"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatForStock(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-md"
                >
                  Add to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Use / Issue Stock Modal */}
      {selectedMatForUsage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Log Material Usage</h3>
              </div>
              <button onClick={() => setSelectedMatForUsage(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {usageError && (
              <div className="mt-3 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                {usageError}
              </div>
            )}

            <form onSubmit={handleExecuteStockUse} className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-slate-400">Material to Issue:</div>
                <div className="font-bold text-sm text-white">{selectedMatForUsage.name}</div>
                <div className="text-emerald-400 font-bold">
                  Available in Stock: {selectedMatForUsage.quantity} {selectedMatForUsage.unit}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Quantity Used ({selectedMatForUsage.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min="0.1"
                  max={selectedMatForUsage.quantity}
                  step="0.1"
                  value={usageQty}
                  onChange={e => setUsageQty(Number(e.target.value) || '')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-extrabold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Issued to Worker / Foreman
                </label>
                <input
                  type="text"
                  required
                  value={usageWorker}
                  onChange={e => setUsageWorker(e.target.value)}
                  placeholder="e.g. Carlos Mendez (Mason)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Task / Location Notes
                </label>
                <input
                  type="text"
                  value={usageNotes}
                  onChange={e => setUsageNotes(e.target.value)}
                  placeholder="e.g. West wall mortar mixing"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatForUsage(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md"
                >
                  Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
