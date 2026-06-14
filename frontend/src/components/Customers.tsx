"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ShoppingBag, Send, Sparkles, SlidersHorizontal, ArrowUpDown, Plus, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // Create Customer Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    totalSpend: '',
    ordersCount: '',
    segment: 'Active'
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const queryClient = useQueryClient();

  // Create Customer Mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create customer');
      }
      return response.json();
    },
    onSuccess: () => {
      setIsCreateModalOpen(false);
      setCreateFormData({
        name: '',
        email: '',
        phone: '',
        totalSpend: '',
        ordersCount: '',
        segment: 'Active'
      });
      setFormErrors({});
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      // Refetch customers
      const fetchCustomers = async () => {
        setIsLoading(true);
        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: '10',
            search,
            segment,
            sortBy,
            sortOrder
          });
          const response = await fetch(`http://localhost:5000/api/customers?${queryParams}`);
          const data = await response.json();
          setCustomers(data.customers || []);
          setTotalPages(data.pagination?.totalPages || 1);
        } catch (e) {
          console.error('Error fetching customers list:', e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCustomers();
    },
    onError: (error: any) => {
      setFormErrors({ submit: error.message });
    }
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: {[key: string]: string} = {};

    // Validation
    if (!createFormData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!createFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createFormData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!createFormData.phone.trim()) {
      errors.phone = 'Phone is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    createCustomerMutation.mutate({
      name: createFormData.name,
      email: createFormData.email,
      phone: createFormData.phone,
      totalSpend: parseFloat(createFormData.totalSpend) || 0,
      ordersCount: parseInt(createFormData.ordersCount) || 0,
      segment: createFormData.segment
    });
  };

  // Fetch customers list
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          search,
          segment,
          sortBy,
          sortOrder
        });

        const response = await fetch(`http://localhost:5000/api/customers?${queryParams}`);
        const data = await response.json();
        setCustomers(data.customers || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (e) {
        console.error('Error fetching customers list:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [page, search, segment, sortBy, sortOrder]);

  // Fetch customer details when a row is clicked
  useEffect(() => {
    if (!selectedCustomerId) {
      setSelectedCustomerDetail(null);
      return;
    }

    const fetchCustomerDetail = async () => {
      setIsDetailLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/customers/${selectedCustomerId}`);
        const data = await response.json();
        setSelectedCustomerDetail(data);
      } catch (e) {
        console.error('Error fetching customer details:', e);
      } finally {
        setIsDetailLoading(false);
      }
    };

    fetchCustomerDetail();
  }, [selectedCustomerId]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer CRM</h1>
        <p className="text-slate-400 mt-1">Manage, analyze, and inspect your consumer database profiles.</p>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search customer name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Segment selector */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={segment}
            onChange={(e) => { setSegment(e.target.value); setPage(1); }}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Segments</option>
            <option value="VIP">VIP</option>
            <option value="Active">Active</option>
            <option value="Dormant">Dormant</option>
          </select>
        </div>

        {/* Add Customer Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow cursor-pointer transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Customer Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm animate-pulse-soft">Loading database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/20" onClick={() => toggleSort('name')}>
                    <span className="flex items-center space-x-1.5">
                      <span>Customer</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="p-4">Segment</th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/20" onClick={() => toggleSort('totalSpend')}>
                    <span className="flex items-center space-x-1.5">
                      <span>Total Spend</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/20" onClick={() => toggleSort('lastOrderDate')}>
                    <span className="flex items-center space-x-1.5">
                      <span>Last Order</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/20" onClick={() => toggleSort('ordersCount')}>
                    <span className="flex items-center space-x-1.5">
                      <span>Orders Count</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {customers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 cursor-pointer transition"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{cust.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{cust.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        cust.segment === 'VIP' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400' :
                        cust.segment === 'Dormant' ? 'bg-pink-100 text-pink-800 dark:bg-pink-950/30 dark:text-pink-400' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                      }`}>
                        {cust.segment}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-200">
                      ₹{cust.totalSpend ? cust.totalSpend.toLocaleString() : '0'}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-semibold">
                      {cust.ordersCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">Page {page} of {totalPages}</span>
          <div className="flex space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 font-medium rounded-md cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 font-medium rounded-md cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out CRM Drawer */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedCustomerId(null)}></div>

          {/* Panel */}
          <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full animate-slideLeft">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
              <div>
                <h3 className="text-lg font-bold">Customer Dossier</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Segment profile tracking details</p>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isDetailLoading || !selectedCustomerDetail ? (
                <div className="flex flex-col items-center justify-center h-80 space-y-3">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400 animate-pulse-soft">Retrieving CRM dossier details...</p>
                </div>
              ) : (
                <>
                  {/* Client Dossier Profile */}
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <h4 className="text-xl font-bold">{selectedCustomerDetail.name}</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold uppercase block">Email Address</span>
                        <span className="font-semibold">{selectedCustomerDetail.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold uppercase block">Phone Contact</span>
                        <span className="font-semibold">{selectedCustomerDetail.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold uppercase block">Lifetime Value</span>
                        <span className="font-bold text-indigo-500 text-sm">₹{selectedCustomerDetail.totalSpend.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold uppercase block">Dossier Segment</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] mt-0.5 inline-block ${
                          selectedCustomerDetail.segment === 'VIP' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400' :
                          selectedCustomerDetail.segment === 'Dormant' ? 'bg-pink-100 text-pink-800 dark:bg-pink-950/30 dark:text-pink-400' :
                          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                        }`}>
                          {selectedCustomerDetail.segment}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Summary Section */}
                  <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 space-y-2.5">
                    <div className="flex items-center space-x-2 text-indigo-500 dark:text-indigo-400 font-bold text-sm">
                      <Sparkles className="w-4.5 h-4.5 animate-pulse-soft" />
                      <span>XenoPilot Customer Intelligence</span>
                    </div>
                    <p className="text-xs leading-relaxed font-semibold text-slate-700 dark:text-slate-300">{selectedCustomerDetail.aiSummary}</p>
                  </div>

                  {/* Transaction Orders list */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-200">
                      <ShoppingBag className="w-4.5 h-4.5 text-indigo-500" />
                      <h4 className="font-bold">Transaction History</h4>
                    </div>
                    {selectedCustomerDetail.orders.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No transactions recorded for this customer.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 text-xs">
                        {selectedCustomerDetail.orders.map((ord: any) => (
                          <div key={ord.id} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-850/50">
                            <div>
                              <span className="font-bold block">₹{ord.amount.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{new Date(ord.orderDate).toLocaleDateString()}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                              {ord.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Campaign history timeline */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-200">
                      <Send className="w-4.5 h-4.5 text-pink-500" />
                      <h4 className="font-bold">Marketing Communications</h4>
                    </div>
                    {selectedCustomerDetail.communications.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No marketing campaigns sent to this customer.</p>
                    ) : (
                      <div className="space-y-4 relative pl-4 border-l border-slate-200 dark:border-slate-800 ml-2 pt-2">
                        {selectedCustomerDetail.communications.map((comm: any) => (
                          <div key={comm.id} className="relative space-y-1 text-xs">
                            {/* Dot indicator */}
                            <div className="absolute -left-[22px] top-1 w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full border-2 border-white dark:border-slate-900"></div>
                            
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{comm.campaign.name}</span>
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                comm.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                                comm.status === 'FAILED' ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400' :
                                'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {comm.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold">
                              <span>Sent via {comm.campaign.channel} on {new Date(comm.sentAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCreateModalOpen(false)}></div>

          {/* Modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                <div>
                  <h3 className="text-lg font-bold">Add New Customer</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Create a new customer profile</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  {formErrors.name && <p className="text-xs text-rose-500 mt-1">{formErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({...createFormData, email: e.target.value})}
                    placeholder="customer@example.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  {formErrors.email && <p className="text-xs text-rose-500 mt-1">{formErrors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone *</label>
                  <input
                    type="text"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData({...createFormData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  {formErrors.phone && <p className="text-xs text-rose-500 mt-1">{formErrors.phone}</p>}
                </div>

                {/* Total Spend */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Total Spend (₹)</label>
                  <input
                    type="number"
                    value={createFormData.totalSpend}
                    onChange={(e) => setCreateFormData({...createFormData, totalSpend: e.target.value})}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Orders Count */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Orders Count</label>
                  <input
                    type="number"
                    value={createFormData.ordersCount}
                    onChange={(e) => setCreateFormData({...createFormData, ordersCount: e.target.value})}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Segment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Segment</label>
                  <select
                    value={createFormData.segment}
                    onChange={(e) => setCreateFormData({...createFormData, segment: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="VIP">VIP</option>
                    <option value="Dormant">Dormant</option>
                  </select>
                </div>

                {/* Submit Error */}
                {formErrors.submit && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg">
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{formErrors.submit}</p>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-sm cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCustomerMutation.isPending}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createCustomerMutation.isPending ? 'Creating...' : 'Create Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slideUp">
          <div className="bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold text-sm">Customer created successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}
