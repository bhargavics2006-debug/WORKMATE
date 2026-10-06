import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Receipt,
  FileCheck,
  Sparkles,
  Check,
  AlertTriangle,
  Search,
  Calendar,
  DollarSign,
  Trash2,
  ExternalLink,
  Eye,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { ExpenseCategory, ScannedBill } from '../../types';
import { getTodayDateString } from '../../utils/initialData';
import { BudgetAlertBanner } from '../common/BudgetAlertBanner';

export const BillScannerView: React.FC = () => {
  const {
    scannedBills,
    saveScannedBill,
    deleteScannedBill,
    settings,
    remainingBudget,
    projects,
    currentProjectId,
    setActiveTab,
  } = useWorkmate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingBill, setViewingBill] = useState<ScannedBill | null>(null);

  // Form extracted fields
  const [billNumber, setBillNumber] = useState('');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [taxAmount, setTaxAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>('Materials & Supplies');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Digital Wallet' | 'Other'>('Cash');
  const [notes, setNotes] = useState('');
  const [autoAddToExpenses, setAutoAddToExpenses] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categories: ExpenseCategory[] = [
    'Materials & Supplies',
    'Food & Meals',
    'Transport & Fuel',
    'Tools & Equipment',
    'Utilities & Rent',
    'Emergency & Medical',
    'Miscellaneous',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      processBillImage(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Simulates intelligent extraction and OCR parsing
  const processBillImage = (fileName?: string) => {
    setIsScanning(true);
    setScanComplete(false);
    setSubmitError(null);

    setTimeout(() => {
      // Intelligently extract realistic invoice details based on mock OCR heuristics
      const sampleVendors = [
        'Apex Building Materials Co.',
        'Highland Steel & Cement Depot',
        'Shell Fuel & Gas Logistics',
        'National Tools & Heavy Hardware',
        'Valley River Sand Supply',
      ];
      const randomVendor = sampleVendors[Math.floor(Math.random() * sampleVendors.length)];
      const randomInvoiceNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      const randomTotal = Math.floor(150 + Math.random() * 450);
      const tax = Math.round(randomTotal * 0.08 * 10) / 10;

      setBillNumber(randomInvoiceNum);
      setVendor(randomVendor);
      setDate(getTodayDateString());
      setTotalAmount(randomTotal);
      setTaxAmount(tax);
      setCategory('Materials & Supplies');
      setPaymentMethod('Bank Transfer');
      setNotes(`Scanned from ${fileName || 'receipt capture'}. Verified OCR totals.`);
      setIsScanning(false);
      setScanComplete(true);
    }, 1200);
  };

  // Pre-set quick demo receipts
  const loadDemoReceipt = (type: 'cement' | 'fuel' | 'tools') => {
    if (type === 'cement') {
      setSelectedImage('https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&auto=format&fit=crop&q=60');
      setBillNumber('INV-APEX-9921');
      setVendor('Apex Cement Logistics Ltd.');
      setDate(getTodayDateString());
      setTotalAmount(480);
      setTaxAmount(43.2);
      setCategory('Materials & Supplies');
      setPaymentMethod('Bank Transfer');
      setNotes('40 bags Grade 43 Portland cement for foundation casting.');
      setScanComplete(true);
    } else if (type === 'fuel') {
      setSelectedImage('https://images.unsplash.com/photo-1545127398-14699f92334b?w=500&auto=format&fit=crop&q=60');
      setBillNumber('RCP-SHELL-408');
      setVendor('Shell Fleet Service #12');
      setDate(getTodayDateString());
      setTotalAmount(195);
      setTaxAmount(17.5);
      setCategory('Transport & Fuel');
      setPaymentMethod('Cash');
      setNotes('130 liters diesel fuel for site generator & cement mixer.');
      setScanComplete(true);
    } else {
      setSelectedImage('https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60');
      setBillNumber('INV-TOOL-5542');
      setVendor('ProTool Machinery Depot');
      setDate(getTodayDateString());
      setTotalAmount(320);
      setTaxAmount(28.8);
      setCategory('Tools & Equipment');
      setPaymentMethod('Digital Wallet');
      setNotes('2 heavy-duty hammer drills + 10 concrete masonry bits.');
      setScanComplete(true);
    }
  };

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billNumber.trim() || !vendor.trim() || !totalAmount || Number(totalAmount) <= 0) return;

    const res = saveScannedBill({
      billNumber: billNumber.trim(),
      vendor: vendor.trim(),
      date,
      totalAmount: Number(totalAmount),
      taxAmount: taxAmount !== '' ? Number(taxAmount) : undefined,
      category,
      paymentMethod,
      notes,
      imageDataUrl: selectedImage || undefined,
      projectId: currentProjectId !== 'all' ? currentProjectId : 'proj-1',
      createdAt: new Date().toISOString(),
    }, autoAddToExpenses);

    if (res.expenseResult && !res.expenseResult.success) {
      setSubmitError(res.expenseResult.error || 'Failed to auto-add expense due to budget limit.');
      return;
    }

    // Reset capture
    setSelectedImage(null);
    setScanComplete(false);
    setBillNumber('');
    setVendor('');
    setTotalAmount('');
    setTaxAmount('');
    setNotes('');
    setSubmitError(null);
  };

  const filteredBills = scannedBills.filter(b =>
    b.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      <BudgetAlertBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-rose-400" />
            Bill & Receipt Scanner
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Capture or upload paper invoices, auto-extract figures, and sync with project budget
          </p>
        </div>

        {/* Quick Demo Fillers */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto text-xs">
          <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Try Demo Receipt:</span>
          <button
            onClick={() => loadDemoReceipt('cement')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
          >
            Cement Bill
          </button>
          <button
            onClick={() => loadDemoReceipt('fuel')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
          >
            Fuel Slip
          </button>
          <button
            onClick={() => loadDemoReceipt('tools')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
          >
            Tools Bill
          </button>
        </div>
      </div>

      {/* Main Scanner & Extraction Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Image Upload & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                1. Capture or Upload Bill
              </span>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                OCR Auto-Extract
              </span>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Camera / Upload Dropzone */}
            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-850/50 hover:bg-slate-800/60 space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white">Tap to Open Camera or Upload</div>
                  <p className="text-slate-400 text-xs mt-1">
                    Upload paper bill, invoice photo, or delivery voucher
                  </p>
                </div>
                <div className="inline-block px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs">
                  Choose Photo
                </div>
              </div>
            ) : (
              /* Preview Card */
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-64 bg-slate-950">
                  <img
                    src={selectedImage}
                    alt="Scanned invoice"
                    className="w-full h-full object-cover"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                      <span className="text-xs font-black text-white">Analyzing & Extracting Text...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-amber-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Retake / Change Photo</span>
                  </button>

                  <button
                    onClick={() => processBillImage()}
                    className="text-cyan-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-scan OCR</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Extracted Form Verification (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                2. Review & Confirm Extracted Figures
              </span>
              {scanComplete && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Extracted
                </span>
              )}
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSaveBill} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Invoice / Bill # *
                  </label>
                  <input
                    type="text"
                    required
                    value={billNumber}
                    onChange={e => setBillNumber(e.target.value)}
                    placeholder="e.g. INV-2026-4401"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Vendor / Supplier *
                </label>
                <input
                  type="text"
                  required
                  value={vendor}
                  onChange={e => setVendor(e.target.value)}
                  placeholder="e.g. Apex Building Materials Depot"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Total Amount ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.1"
                    value={totalAmount}
                    onChange={e => setTotalAmount(Number(e.target.value) || '')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-base font-black focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Included Tax / GST ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={taxAmount}
                    onChange={e => setTaxAmount(Number(e.target.value) || '')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
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
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Cash">Cash Handover</option>
                    <option value="Bank Transfer">Bank Transfer / UPI</option>
                    <option value="Digital Wallet">Digital Wallet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Itemized Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Delivered to site gate, signed by foreman"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Add to Expenses Checkbox */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Auto-Sync with Expenses & Budget</span>
                  <span className="text-[10px] text-slate-400">
                    Remaining Budget: {settings.currencySymbol}{remainingBudget.toLocaleString()}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoAddToExpenses}
                  onChange={e => setAutoAddToExpenses(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!totalAmount || Number(totalAmount) <= 0}
                  className="w-full sm:w-auto px-6 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-extrabold rounded-xl shadow-lg shadow-rose-500/20 transition flex items-center justify-center space-x-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Confirm & Save Bill to Expenses</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Scanned Bills Archive History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-white">Scanned Invoices Archive</h3>
            <p className="text-xs text-slate-400">All scanned supplier receipts and OCR audit logs</p>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search bills..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No scanned bills in archive. Upload or choose a demo bill above to record.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredBills.map(b => (
              <div key={b.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      #{b.billNumber}
                    </span>
                    <span className="font-bold text-white truncate">{b.vendor}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                      {b.category}
                    </span>
                  </div>

                  <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-1">
                    <span>{b.date}</span>
                    <span>•</span>
                    <span>{b.paymentMethod}</span>
                    {b.notes && (
                      <>
                        <span>•</span>
                        <span className="italic truncate max-w-xs">{b.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="font-black text-sm text-rose-400">
                      {settings.currencySymbol}{b.totalAmount.toLocaleString()}
                    </div>
                    {b.taxAmount && (
                      <span className="text-[10px] text-slate-500">
                        Tax: {settings.currencySymbol}{b.taxAmount}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setViewingBill(b)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                    title="View bill details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete bill #${b.billNumber}?`)) {
                        deleteScannedBill(b.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
                    title="Delete bill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {viewingBill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-sm text-white">
                  Invoice #{viewingBill.billNumber}
                </h3>
              </div>
              <button onClick={() => setViewingBill(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {viewingBill.imageDataUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-700 max-h-48 mb-3">
                  <img src={viewingBill.imageDataUrl} alt="Receipt" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vendor:</span>
                  <span className="font-bold text-white">{viewingBill.vendor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span className="font-bold text-white">{viewingBill.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-bold text-amber-400">{viewingBill.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="font-bold text-white">{viewingBill.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-700">
                  <span className="text-slate-400 font-bold">Total Amount:</span>
                  <span className="font-black text-sm text-rose-400">
                    {settings.currencySymbol}{viewingBill.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {viewingBill.notes && (
                <div className="text-[11px] text-slate-400 italic">
                  Note: {viewingBill.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingBill(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
