import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../services/api';
import { Owner } from '../types';
import AddOwnerForm from '../components/AddOwnerForm';
import EditOwnerForm from '../components/EditOwnerForm';
import OwnerDetailsModal from '../components/OwnerDetailsModal';
import AddKennelLicenseForm from '../components/AddKennelLicenseForm';

const OwnersPage = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [isAddOwnerFormOpen, setIsAddOwnerFormOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [isKennelLicenseFormOpen, setIsKennelLicenseFormOpen] = useState(false);

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ownerAPI.getAll();
      setOwners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load owners');
      console.error('Error loading owners:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOwners = owners.filter(owner => {
    const searchLower = searchTerm.toLowerCase();
    return (
      owner.FirstName?.toLowerCase().includes(searchLower) ||
      owner.LastName?.toLowerCase().includes(searchLower) ||
      owner.Email?.toLowerCase().includes(searchLower) ||
      owner.Phone1?.toLowerCase().includes(searchLower) ||
      owner.Phone2?.toLowerCase().includes(searchLower) ||
      owner.City?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOwners = filteredOwners.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOwnerAdded = () => {
    loadOwners();
  };

  const handleOwnerUpdated = () => {
    loadOwners();
  };

 const handleViewOwner = async (owner: Owner) => {
  try {
    // IMPORTANT: Fetch full owner details with dogs
    const fullOwnerData = await ownerAPI.getById(owner.OwnerID);
    console.log('Full owner data:', fullOwnerData); // Debug
    setSelectedOwner(fullOwnerData); // This should have dogs array
    setIsDetailsModalOpen(true);
  } catch (err) {
    console.error('Error loading owner details:', err);
  }
};

  const handleEditOwner = (owner: Owner) => {
    setSelectedOwner(owner);
    setIsDetailsModalOpen(false);
    setIsEditFormOpen(true);
  };

  const handleEditFormDetails = () => {
    setIsDetailsModalOpen(false);
    setIsEditFormOpen(true);
  };

  const handleIssueKennelLicense = () => {
  setIsDetailsModalOpen(false);
  setIsKennelLicenseFormOpen(true);
  // selectedOwner is already set
};

  const handleDeleteOwner = async () => {
    if (!selectedOwner) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedOwner.FirstName} ${selectedOwner.LastName}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await ownerAPI.delete(selectedOwner.OwnerID);
      setIsDetailsModalOpen(false);
      setSelectedOwner(null);
      loadOwners();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete owner');
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 mx-1 rounded ${
          currentPage === 1
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        Previous
      </button>
    );

    // Page number buttons
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage < maxVisibleButtons - 1) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className="px-3 py-1 mx-1 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="px-2">...</span>);
      }
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="px-2">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 mx-1 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 mx-1 rounded ${
          currentPage === totalPages
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        Next
      </button>
    );

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Owners</h1>
            </div>
            <button 
              onClick={() => setIsAddOwnerFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-sm"
            >
              + Add Owner
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error loading owners</p>
            <p className="text-sm">{error}</p>
            <button onClick={loadOwners} className="text-sm underline mt-2 hover:text-red-800">
              Try again
            </button>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, phone, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Owners</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{owners.length}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        {/* Owners Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Alternative Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3">Loading owners...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentOwners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <p>{filteredOwners.length === 0 && searchTerm ? 'No owners found matching your search' : 'No owners found'}</p>
                    </td>
                  </tr>
                ) : (
                  currentOwners.map((owner) => (
                    <tr key={owner.OwnerID} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {owner.FirstName} {owner.LastName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={owner.Email || 'N/A'}>
                          {owner.Email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{owner.Phone1 || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{owner.Phone2 || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={owner.Address || 'N/A'}>
                          {owner.Address || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {owner.City}, {owner.Province} {owner.PostalCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewOwner(owner)}
                          className="text-blue-600 hover:text-blue-900 mr-3 transition">
                          View
                        </button>
                        <button 
                          onClick={() => handleEditOwner(owner)}
                          className="text-green-600 hover:text-green-900 transition">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredOwners.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastItem, filteredOwners.length)}</span> of{' '}
                    <span className="font-medium">{filteredOwners.length}</span> entries
                  </p>
                </div>
                <div className="flex items-center">
                  {renderPaginationButtons()}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddOwnerForm
        isOpen={isAddOwnerFormOpen}
        onClose={() => setIsAddOwnerFormOpen(false)}
        onSuccess={handleOwnerAdded}
      />

      <EditOwnerForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setSelectedOwner(null);
        }}
        onSuccess={handleOwnerUpdated}
        owner={selectedOwner}
      />

      <OwnerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOwner(null);
        }}
        onEdit={handleEditFormDetails}
        onDelete={handleDeleteOwner}
        owner={selectedOwner}
        onIssueKennelLicense={handleIssueKennelLicense}
      />

      <AddKennelLicenseForm
  isOpen={isKennelLicenseFormOpen}
  onClose={() => {
    setIsKennelLicenseFormOpen(false);
    setSelectedOwner(null);
  }}
  onSuccess={() => {
    loadOwners();
    // Optionally show success message
  }}
  preselectedOwnerId={selectedOwner?.OwnerID}
/>
    </div>
  );
};

export default OwnersPage;