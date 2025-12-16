import React from 'react';
import {OwnerDetailsModalProps } from '../types';


const OwnerDetailsModal: React.FC<OwnerDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  owner,
  onDelete,
  onIssueKennelLicense,
}) => {

   // Add this debug line
  console.log('Owner data in modal:', owner);
  console.log('Dogs array:', owner?.dogs);
  console.log('Dog count:', owner?.dogs?.length);
  
  if (!isOpen || !owner) return null;

  const DetailField: React.FC<{ label: string; value?: string | number }> = ({ 
    label, 
    value 
  }) => (
    <div className="p-3 bg-gray-50 rounded-lg">
      <label className="block text-xs font-medium text-gray-500 uppercase">
        {label}
      </label>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 z-50">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Owner Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Owner Information */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailField label="First Name" value={owner.FirstName} />
                <DetailField label="Last Name" value={owner.LastName} />
                <DetailField label="Email" value={owner.Email} />
                <DetailField label="Owner ID" value={owner.OwnerID} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Dogs</label>
                <p className="text-gray-900 font-medium">{owner.dogs?.length || 0} dogs</p>
                </div>
            </div>

            {/* Contact Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailField label="Phone Number" value={owner.Phone1} />
                <DetailField label="Alternative Phone" value={owner.Phone2} />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Address Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <DetailField label="Address" value={owner.Address} />
                </div>
                <DetailField label="City" value={owner.City} />
                <DetailField label="Province" value={owner.Province} />
                <DetailField label="Postal Code" value={owner.PostalCode} />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex justify-between pt-4 border-t">
            {owner.dogs && owner.dogs.length >= 3 && (
              <button
              onClick={onIssueKennelLicense}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Issue Kennel License
                </button>
              )}
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
            >
              Delete Owner
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDetailsModal;