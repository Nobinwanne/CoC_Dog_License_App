import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../services/api';
import {Owner } from '../types';



const OwnersPage = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-sm">
              + Add Owner
            </button>
          </div>
        </div>
      </div>

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
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3">Loading owners...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <p>No owners found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => (
                    <tr key={owner.OwnerID} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {owner.FirstName} {owner.LastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{owner.Email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{owner.Phone1 || 'N/A'}</div>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{owner.Phone2 || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{owner.Address || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {owner.City}, {owner.Province} {owner.PostalCode}
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
    </div>
  );
};

export default OwnersPage;