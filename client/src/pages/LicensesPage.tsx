import React, { useState, useEffect } from 'react';
import { licenseAPI } from '../services/api';
import LicenseDetailsModal from '../components/LicenseDetailsModal';
import PaymentForm from '../components/PaymentForm';
import { License } from '../types';


const LicensesPage = () => {
 const [licenses, setLicenses] = useState<License[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add new state for payment form
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedLicenseForPayment, setSelectedLicenseForPayment] = useState<License | null>(null);


  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await licenseAPI.getAll();
      setLicenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load licenses');
      console.error('Error loading licenses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add handler for opening payment form
  const handleRecordPayment = (license: License) => {
    setSelectedLicenseForPayment(license);
    setIsPaymentFormOpen(true);
  };

  // Add handler for payment success
  const handlePaymentSuccess = () => {
    loadLicenses(); // Reload licenses after payment
  };

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = 
      license.DogName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.LastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.LicenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'active' && license.Status === 'Active') ||
      (activeTab === 'expiring' && license.Status === 'Expiring') ||
      (activeTab === 'expired' && license.Status === 'Expired');
    
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      // case 'Expiring': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { label: 'Total Licenses', value: licenses.length, icon: '📋' },
    { label: 'Active', value: licenses.filter(l => l.Status === 'Active').length, icon: '✓' },
    // { label: 'Expiring Soon', value: licenses.filter(l => l.Status === 'Expiring').length, icon: '⚠' },
    { label: 'Expired', value: licenses.filter(l => l.Status === 'Expired').length, icon: '✕' }
  ];

  function handleRenewLicense(_license: License): void {
    throw new Error('Function not implemented.');
  }


  return(
     <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <svg className="h-10 w-10 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Licenses</h2>
            </div>
            <button
              onClick={() => { setSelectedLicense(null); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-sm"
            >
              + New License
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error loading licenses</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={loadLicenses} 
              className="text-sm underline mt-2 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by owner name, dog name, or license number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'expired'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Licenses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License #</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dog</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {loading ? (
          <tr>
            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3">Loading licenses...</span>
              </div>
            </td>
          </tr>
        ) : filteredLicenses.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
              <div className="flex flex-col items-center">
                <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No licenses found</p>
              </div>
            </td>
          </tr>
        ) : (
          filteredLicenses.map((license) => (
            <tr key={license.LicenseID} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                {license.LicenseNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{license.DogName}</div>
                <div className="text-sm text-gray-500">{license.Breed}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {license.FirstName} {license.LastName}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{license.Email}</div>
                <div className="text-sm text-gray-500">{license.Phone}</div>
              </td>
             
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(license.Status)}`}>
                  {license.Status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => { setSelectedLicense(license); setIsModalOpen(true); }}
                  className="text-blue-600 hover:text-blue-900 mr-3 transition"
                >
                  View
                </button>
                <button 
                  onClick={() => handleRecordPayment(license)}
                  className="text-green-600 hover:text-green-900 mr-3 transition"
                >
                  Payment
                </button>
                <button 
                  onClick={() => handleRenewLicense(license)}
                  className="text-orange-600 hover:text-orange-900 transition"
                >
                  Renew
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>
      </main>

      {/* License Details Modal */}
      <LicenseDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        license={selectedLicense}
      />

       {/* Add Payment Form Modal */}
      <PaymentForm
        isOpen={isPaymentFormOpen}
        onClose={() => setIsPaymentFormOpen(false)}
        license={selectedLicenseForPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
};

export default LicensesPage;