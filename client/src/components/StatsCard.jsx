import React, { useState, useEffect } from 'react';

// API Service
const API_BASE_URL = 'http://localhost:5000/api';

const api = {
  getLicenses: async () => {
    const response = await fetch(`${API_BASE_URL}/licenses`);
    if (!response.ok) throw new Error('Failed to fetch licenses');
    return response.json();
  },
  
  searchLicenses: async (term) => {
    const response = await fetch(`${API_BASE_URL}/licenses/search/${term}`);
    if (!response.ok) throw new Error('Failed to search licenses');
    return response.json();
  }
};

// Stats Card Component
function StatsCard({ label, value, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`text-4xl ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

// Search Filter Component
function SearchFilter({ searchTerm, onSearchChange, activeTab, onTabChange }) {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'expiring', label: 'Expiring' },
    { id: 'expired', label: 'Expired' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by owner name, dog name, or license number..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// License Table Component
function LicenseTable({ licenses, loading, onViewLicense, onRenewLicense }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expiring': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-12 text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500">Loading licenses...</span>
          </div>
        </div>
      </div>
    );
  }

  if (licenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-12 text-center">
          <svg className="h-12 w-12 text-gray-400 mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">No licenses found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dog</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licenses.map((license) => (
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(license.ExpirationDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(license.Status)}`}>
                    {license.Status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => onViewLicense(license)} className="text-blue-600 hover:text-blue-900 mr-3 transition">
                    View
                  </button>
                  {license.Status !== 'Active' && (
                    <button onClick={() => onRenewLicense(license)} className="text-green-600 hover:text-green-900 transition">
                      Renew
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// License Details Modal
function LicenseDetailsModal({ isOpen, onClose, license }) {
  if (!isOpen || !license) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expiring': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const DetailField = ({ label, value }) => (
    <div className="p-3 bg-gray-50 rounded-lg">
      <label className="block text-xs font-medium text-gray-500 uppercase">{label}</label>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">License Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">License Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DetailField label="License Number" value={license.LicenseNumber} />
                <DetailField label="License Type" value={license.LicenseType} />
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase">Status</label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(license.Status)}`}>
                    {license.Status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <DetailField label="Issue Date" value={formatDate(license.IssueDate)} />
                <DetailField label="Expiration Date" value={formatDate(license.ExpirationDate)} />
                <DetailField label="Fee" value={`$${license.Fee?.toFixed(2)}`} />
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dog Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DetailField label="Dog Name" value={license.DogName} />
                <DetailField label="Breed" value={license.Breed} />
                <DetailField label="Color" value={license.Color} />
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Owner Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailField label="Owner Name" value={`${license.FirstName} ${license.LastName}`} />
                <DetailField label="Email" value={license.Email} />
                <DetailField label="Phone" value={license.Phone} />
                <DetailField label="Address" value={license.Address ? `${license.Address}, ${license.City}, ${license.State} ${license.ZipCode}` : 'N/A'} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">
              Edit License
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [licenses, setLicenses] = useState([]);
  const [allLicenses, setAllLicenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLicenses();
      setAllLicenses(data);
      setLicenses(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading licenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterLicenses(term, activeTab);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterLicenses(searchTerm, tab);
  };

  const filterLicenses = (search, tab) => {
    let filtered = allLicenses;

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.DogName?.toLowerCase().includes(term) ||
          l.FirstName?.toLowerCase().includes(term) ||
          l.LastName?.toLowerCase().includes(term) ||
          l.LicenseNumber?.toLowerCase().includes(term) ||
          l.Email?.toLowerCase().includes(term)
      );
    }

    if (tab !== 'all') {
      const statusMap = {
        active: 'Active',
        expiring: 'Expiring',
        expired: 'Expired',
      };
      filtered = filtered.filter((l) => l.Status === statusMap[tab]);
    }

    setLicenses(filtered);
  };

  const handleViewLicense = (license) => {
    setSelectedLicense(license);
    setIsModalOpen(true);
  };

  const stats = [
    { label: 'Total Licenses', value: allLicenses.length, icon: '📋', color: 'blue' },
    { label: 'Active', value: allLicenses.filter((l) => l.Status === 'Active').length, icon: '✓', color: 'green' },
    { label: 'Expiring Soon', value: allLicenses.filter((l) => l.Status === 'Expiring').length, icon: '⚠', color: 'yellow' },
    { label: 'Expired', value: allLicenses.filter((l) => l.Status === 'Expired').length, icon: '✕', color: 'red' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dog License Management</h1>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-sm">
              + New License
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error loading licenses</p>
            <p className="text-sm">{error}</p>
            <button onClick={loadLicenses} className="text-sm underline mt-2">Try again</button>
          </div>
        )}

        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, idx) => (
            <StatsCard key={idx} {...stat} />
          ))}
        </div>

        <LicenseTable
          licenses={licenses}
          loading={loading}
          onViewLicense={handleViewLicense}
          onRenewLicense={handleViewLicense}
        />
      </main>

      <LicenseDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        license={selectedLicense}
      />
    </div>
  );
}

export default App;