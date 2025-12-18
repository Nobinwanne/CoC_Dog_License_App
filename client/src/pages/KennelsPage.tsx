import React, { useState, useEffect } from 'react';
import { kennelAPI } from '../services/api';
import KennelDetailsModal from '../components/KennelDetailsModal';
import RenewKennelForm from '../components/RenewKennelForm';
import { Kennel } from '../types';


const KennelsPage: React.FC = () => {
  const [kennels, setKennels] = useState<Kennel[]>([]);
  const [filteredKennels, setFilteredKennels] = useState<Kennel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [selectedKennel, setSelectedKennel] = useState<Kennel | null>(null);
  const [selectedKennelId, setSelectedKennelId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRenewFormOpen, setIsRenewFormOpen] = useState(false);

  useEffect(() => {
    loadKennels();
  }, []);

  useEffect(() => {
    filterKennels();
  }, [kennels, searchTerm, statusFilter]);

  const loadKennels = async () => {
    try {
      setLoading(true);
      const data = await kennelAPI.getAll();
      setKennels(data);
    } catch (error) {
      console.error('Error loading kennels:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterKennels = () => {
    let filtered = [...kennels];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(k => k.Status.toLowerCase() === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(k =>
        k.KennelLicenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${k.FirstName} ${k.LastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.Email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredKennels(filtered);
  };

  const handleViewDetails = (kennel: Kennel) => {
    setSelectedKennel(kennel);
    setSelectedKennelId(kennel.KennelID);
    setIsDetailsModalOpen(true);
  };

  const handleRenew = (kennel: Kennel) => {
    setSelectedKennel(kennel);
    setSelectedKennelId(kennel.KennelID);
    setIsRenewFormOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  // Statistics
  const stats = {
    total: kennels.length,
    active: kennels.filter(k => k.Status === 'Active').length,
    expired: kennels.filter(k => k.Status === 'Expired').length,
    totalRevenue: kennels.reduce((sum, k) => sum + k.Fee, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading kennel licenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kennel Licenses</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage kennel licenses for owners with 3+ dogs
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Kennels</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expired</p>
                <p className="text-2xl font-semibold text-red-600">{stats.expired}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by license number or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    statusFilter === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    statusFilter === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active ({stats.active})
                </button>
                <button
                  onClick={() => setStatusFilter('expired')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    statusFilter === 'expired'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Expired ({stats.expired})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kennels Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dogs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKennels.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'No kennel licenses found matching your criteria' 
                          : 'No kennel licenses issued yet'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredKennels.map((kennel) => (
                    <tr key={kennel.KennelID} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {kennel.KennelLicenseNumber}
                        </div>
                        <div className="text-xs text-gray-500">Year: {kennel.IssueYear}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {kennel.FirstName} {kennel.LastName}
                        </div>
                        <div className="text-xs text-gray-500">{kennel.Email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {kennel.NumberOfDogs} dogs
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(kennel.IssueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(kennel.ExpiryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(kennel.Fee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          kennel.Status === 'Active' 
                            ? 'bg-green-100 text-green-800'
                            : kennel.Status === 'Expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {kennel.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(kennel)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          View
                        </button>
                        {kennel.Status === 'Expired' && (
                          <button
                            onClick={() => handleRenew(kennel)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Renew
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredKennels.length}</span> of{' '}
              <span className="font-medium">{kennels.length}</span> kennel licenses
            </div>
          </div>
        </div>
      </div>

      {/* Kennel Details Modal */}
      <KennelDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedKennel(null);
          setSelectedKennelId(null);
        }}
        kennelId={selectedKennelId}
        onRenew={() => {
          setIsDetailsModalOpen(false);
          setIsRenewFormOpen(true);
        }}
      />

      {/* Renew Kennel Form */}
      <RenewKennelForm
        isOpen={isRenewFormOpen}
        onClose={() => {
          setIsRenewFormOpen(false);
          setSelectedKennel(null);
          setSelectedKennelId(null);
        }}
        onSuccess={() => {
          loadKennels();
        }}
        kennelId={selectedKennelId}
      />
    </div>
  );
};

export default KennelsPage;