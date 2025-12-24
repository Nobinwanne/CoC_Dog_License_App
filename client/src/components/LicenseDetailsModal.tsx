import React from 'react';
import {DetailFieldProps, LicenseDetailsModalProps } from '../types'


const LicenseDetailsModal = ({ 
  isOpen, 
  onClose, 
  license 
}: LicenseDetailsModalProps) => {
  if (!isOpen || !license) return null;

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const DetailField = ({ 
    label, 
    value 
  }: DetailFieldProps) => (
    <div className="p-3 bg-gray-50 rounded-lg">
      <label className="block text-xs font-medium text-gray-500 uppercase">
        {label}
      </label>
      <p className="mt-1 text-sm font-semibold text-gray-900"> {value instanceof Date
    ? value.toLocaleDateString()
    : value ?? 'N/A'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black opacity-30"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 z-50 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">License Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* License Information */}
          <div className="space-y-6">
            {/* License Status Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                License Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DetailField
                  label="License Number"
                  value={license.LicenseNumber}
                />
                <DetailField label="License Type" value={license.LicenseType} />
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 uppercase">
                    Status
                  </label>
                  <span
                    className={`mt-1 inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      license.Status
                    )}`}
                  >
                    {license.Status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <DetailField
                  label="Issue Date"
                  value={formatDate(license.IssueDate)}
                />
                <DetailField label="Issue Year" value={license.IssueYear} />
                <DetailField label="Fee" value={`$${license.Fee?.toFixed(2)}`} />
              </div>
            </div>

            {/* Dog Information Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Dog Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DetailField label="Dog Name" value={license.DogName} />
                <DetailField label="Breed" value={license.Breed} />
                <DetailField label="Color" value={license.Color} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <DetailField
                  label="Date of Birth"
                  value={formatDate(license.DateOfBirth ?? 'N/A')}
                />
                <DetailField label="Gender" value={license.Gender} />
                <DetailField
                  label="Spayed/Neutered"
                  value={license.IsSpayedNeutered ? 'Yes' : 'No'}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <DetailField  label="Tax Roll" value={license.Roll} />
               <DetailField label="Tag Number" value={license.TagNumber} />
               <DetailField label="Nuisance" value={license.IsNuisance ? 'Yes' : 'No'} />
              </div>
            </div>

            {/* Owner Information Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Owner Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailField
                  label="Owner Name"
                  value={`${license.FirstName} ${license.LastName}`}
                />
                <DetailField label="Email" value={license.Email} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <DetailField label="Phone" value={license.Phone} />
                <DetailField
                  label="Address"
                  value={
                    license.Address
                      ? `${license.Address}, ${license.City}, ${license.Province} ${license.PostalCode}`
                      : 'N/A'
                  }
                />
              </div>
            </div>
          </div>

              {/* Footer Actions in LicenseDetailsModal */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Close
            </button>
            {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">
              Delete License
            </button> */}
         
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LicenseDetailsModal;