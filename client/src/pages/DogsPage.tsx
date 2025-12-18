import React, { useState, useEffect } from 'react';
import { dogAPI } from '../services/api';
import {Dog} from '../types';
import AddDogForm from '../components/AddDogForm';
import EditDogForm from '../components/EditDogForm';
import DogDetailsModal from '../components/DogDetailsModal';


const DogsPage = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [isAddDogFormOpen, setIsAddDogFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null)
  

  useEffect(() => {
    loadDogs();
  }, []);

  const loadDogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dogAPI.getAll();
      setDogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dogs');
      console.error('Error loading dogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDogs = dogs.filter(dog => {
    const searchLower = searchTerm.toLowerCase();
    return (
      dog.DogName?.toLowerCase().includes(searchLower) ||
      dog.Breed?.toLowerCase().includes(searchLower) ||
      dog.OwnerFirstName?.toLowerCase().includes(searchLower) ||
      dog.OwnerLastName?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredDogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDogs = filteredDogs.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'Unknown';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years === 0) return `${months} months`;
    if (months < 0) return `${years - 1} years`;
    return `${years} years`;
  };

  const handleDogAdded = () => {
    loadDogs();
  };

  const handleDogUpdated = () => {
    loadDogs();
  }

  const handleViewDog = (dog: Dog) => {
    setSelectedDog(dog);
    setIsDetailsModalOpen(true)
  }

  const handleEditDog = (dog: Dog) => {
    setSelectedDog(dog)
    setIsDetailsModalOpen(false)
    setIsEditFormOpen(true)
  }

  const handleEditFormDetails = () => {
    setIsDetailsModalOpen(false)
    setIsEditFormOpen(true)
  }

  const handleDeleteDog = async () => {
    if (!selectedDog) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedDog.DogName}? 
      This action cannot be undone and will also delete all associated licenses`
    )

    if (!confirmed) return;

    try {
      await dogAPI.delete(selectedDog.DogID);
      setIsDetailsModalOpen(false);
      setSelectedDog(null);
      loadDogs();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete dog');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dogs</h1>
            </div>
            <button 
              onClick={() => setIsAddDogFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-sm">
              + Register Dog
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error loading dogs</p>
            <p className="text-sm">{error}</p>
            <button onClick={loadDogs} className="text-sm underline mt-2 hover:text-red-800">
              Try again
            </button>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by dog name, breed, or owner..."
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
              <p className="text-gray-500 text-sm font-medium">Total Dogs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{dogs.length}</p>
            </div>
            <div className="text-4xl">🐕</div>
          </div>
        </div>

        {/* Dogs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dog Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spayed/Neutered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Roll</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3">Loading dogs...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentDogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <p>{filteredDogs.length === 0 && searchTerm ? 'No dogs found matching your search' : 'No dogs found'}</p>
                    </td>
                  </tr>
                ) : (
                  currentDogs.map((dog) => (
                    <tr key={dog.DogID} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dog.DogName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dog.Breed}</div>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dog.Color}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{calculateAge(dog.DateOfBirth)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {dog.Gender === "F" ? "Female" : "Male"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {dog.IsSpayedNeutered === true ? (
                          <span className="text-xs text-green-600">✓ Fixed</span>
                        ) : (
                          <span className="text-xs text-red-600">❌ Not Fixed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {dog.Roll} 
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                        onClick={() => {handleViewDog(dog)}}
                        className="text-blue-600 hover:text-blue-900 mr-3 transition">
                          View
                        </button>
                        <button 
                        onClick={() => {handleEditDog(dog)}}
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
          {!loading && filteredDogs.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastItem, filteredDogs.length)}</span> of{' '}
                    <span className="font-medium">{filteredDogs.length}</span> entries
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
      <AddDogForm
        isOpen={isAddDogFormOpen}
        onClose={() => setIsAddDogFormOpen(false)}
        onSuccess={handleDogAdded}
      />

      <EditDogForm
      isOpen={isEditFormOpen}
      onClose={() => {
        setIsEditFormOpen(false);
        setSelectedDog(null)
      }}
      onSuccess={handleDogUpdated}
      dog={selectedDog}
      />

      <DogDetailsModal
      isOpen={isDetailsModalOpen}
      onClose={() => {
        setIsDetailsModalOpen(false)
        setSelectedDog(null)
      }}
      onEdit={handleEditFormDetails}
      onDelete={handleDeleteDog}
      dog={selectedDog}
      />

    </div>
  );
};

export default DogsPage;