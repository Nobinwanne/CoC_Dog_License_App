import React from 'react';
import { Dog } from '../types';

interface DogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  dog: Dog | null;
}

const DogDetailsModal: React.FC<DogDetailsModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  dog
}) => {
  if (!isOpen || !dog) return null;

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-bold">Dog Details</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Dog Name and Basic Info */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{dog.DogName}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {dog.Gender === 'M' ? 'Male' : 'Female'}
              </span>
              {dog.IsSpayedNeutered && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  ✓ Spayed/Neutered
                </span>
              )}
              {dog.IsNuisance && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  ⚠ Nuisance Dog
                </span>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dog Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">Dog Information</h4>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Breed</label>
                <p className="text-gray-900">{dog.Breed || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Color</label>
                <p className="text-gray-900">{dog.Color || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">{formatDate(dog.DateOfBirth)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Age</label>
                <p className="text-gray-900">{calculateAge(dog.DateOfBirth)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Tax Roll Number</label>
                <p className="text-gray-900 font-medium">{dog.Roll || 'N/A'}</p>
              </div>
            </div>

            {/* Owner Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">Owner Information</h4>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Owner Name</label>
                <p className="text-gray-900">
                  {dog.OwnerFirstName} {dog.OwnerLastName}
                </p>
              </div>

              {dog.OwnerEmail && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{dog.OwnerEmail}</p>
                </div>
              )}

              {dog.OwnerPhone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{dog.OwnerPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {/* {dog.Notes && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 text-lg border-b pb-2 mb-3">Notes</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{dog.Notes}</p>
            </div>
          )} */}

          {/* Timestamps */}
          {/* <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              {dog.CreatedAt && (
                <div>
                  <span className="font-medium">Registered:</span> {formatDate(dog.CreatedAt)}
                </div>
              )}
              {dog.UpdatedAt && (
                <div>
                  <span className="font-medium">Last Updated:</span> {formatDate(dog.UpdatedAt)}
                </div>
              )}
            </div>
          </div> */}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-wrap gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Close
          </button>
          {/* <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Edit Dog
          </button> */}
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Delete Dog
          </button>
        </div>
      </div>
    </div>
  );
};

export default DogDetailsModal;