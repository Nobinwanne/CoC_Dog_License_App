import React, { useState, useEffect } from 'react';
import { dogAPI } from '../services/api';
import {Dog} from '../types';
import AddDogForm from '../components/AddDogForm';


const DogsPage = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   // Add state for the form modal
  const [isAddDogFormOpen, setIsAddDogFormOpen] = useState(false);


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

  // Add handler for successful dog registration
  const handleDogAdded = () => {
    loadDogs(); // Reload the dogs list
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
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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
                ) : filteredDogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <p>No dogs found</p>
                    </td>
                  </tr>
                ) : (
                  filteredDogs.map((dog) => (
                    <tr key={dog.DogID} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dog.DogName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dog.Breed}</div>
                        <div className="text-sm text-gray-500">{dog.Color}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{calculateAge(dog.DateOfBirth)}</div>
                      </td>
                      {dog.Gender === "F" ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Female</div>
                      </td>
                      ) : (
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Male</div>
                      </td>
                      )
                      }
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {dog.IsSpayedNeutered === true ? (
                          <span className="text-xs text-green-600">✓ Fixed</span>
                        ): (
                            <span className="text-xs text-green-600"> ❌ Not Fixed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {dog.Roll} 
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3 transition">
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-900 transition">
                          Edit
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

      {/* Add Dog Form Modal */}
      <AddDogForm
        isOpen={isAddDogFormOpen}
        onClose={() => setIsAddDogFormOpen(false)}
        onSuccess={handleDogAdded}
      />
    </div>
  );
};

export default DogsPage;