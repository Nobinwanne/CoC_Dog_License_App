import React, { useState, useEffect } from 'react';
import { kennelAPI } from '../services/api';

interface KennelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  kennelId: number | null;
  onRenew?: () => void;
}

interface Dog {
  DogID: number;
  DogName: string;
  Breed: string;
  TagNumber: string;
  tags: string[];
}

interface KennelDetails {
  KennelID: number;
  OwnerID: number;
  KennelLicenseNumber: string;
  IssueDate: string;
  ExpiryDate: string;
  IssueYear: string;
  Fee: number;
  Status: string;
  PaymentMethod: string;
  TransactionID: string;
  PaymentStatus: string;
  Notes: string;
  NumberOfDogs: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Address: string;
  City: string;
  Province: string;
  PostalCode: string;
  dogs: Dog[];
}

const KennelDetailsModal: React.FC<KennelDetailsModalProps> = ({
  isOpen,
  onClose,
  kennelId,
  onRenew
}) => {
  const [kennel, setKennel] = useState<KennelDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && kennelId) {
      loadKennelDetails();
    }
  }, [isOpen, kennelId]);

  const loadKennelDetails = async () => {
    if (!kennelId) return;
    
    try {
      setLoading(true);
      const data = await kennelAPI.getById(kennelId);
      setKennel(data);
    } catch (error) {
      console.error('Error loading kennel details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = kennel && new Date(kennel.ExpiryDate) < new Date();

  const handlePrintReceipt = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg print:bg-white print:text-gray-900 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-2 print:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h2 className="text-xl font-bold">Kennel License Receipt</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition print:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : kennel ? (
          <div className="px-6 py-6">
            {/* Header Info */}
            <div className="text-center mb-6 pb-4 border-b-2 border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Kennel License Receipt</h1>
              <p className="text-sm text-gray-600 mt-1">City Dog Licensing Department</p>
            </div>

            {/* Status Banner for Expired */}
            {isExpired && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-red-800">
                    This kennel license has expired. Please renew to maintain coverage.
                  </p>
                </div>
              </div>
            )}

            {/* Kennel License Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Kennel License Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">License Number</p>
                  <p className="text-gray-900 font-medium">{kennel.KennelLicenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Issue Year</p>
                  <p className="text-gray-900">{kennel.IssueYear}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Issue Date</p>
                  <p className="text-gray-900">{formatDate(kennel.IssueDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                  <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatDate(kennel.ExpiryDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    kennel.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {kennel.Status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Dogs Covered</p>
                  <p className="text-gray-900 font-medium">{kennel.NumberOfDogs} dogs</p>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Owner Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-gray-900">{kennel.FirstName} {kennel.LastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <p className="text-gray-900">{kennel.Phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{kennel.Email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-gray-900">
                    {kennel.Address && kennel.City 
                      ? `${kennel.Address}, ${kennel.City}, ${kennel.Province} ${kennel.PostalCode}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dogs Covered */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                Dogs Covered Under This Kennel License
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dog Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Breed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tag Numbers</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {kennel.dogs && kennel.dogs.length > 0 ? (
                      kennel.dogs.map((dog) => (
                        <tr key={dog.DogID}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{dog.DogName}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{dog.Breed}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {dog.tags && dog.tags.length > 0 
                              ? dog.tags.join(', ')
                              : dog.TagNumber || 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500 text-sm">
                          No dogs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Payment Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount Paid</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(kennel.Fee)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Status</p>
                    <span className={`mt-1 px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getPaymentStatusColor(kennel.PaymentStatus || 'Completed')}`}>
                      {kennel.PaymentStatus || 'Completed'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p className="text-gray-900">{kennel.PaymentMethod || 'N/A'}</p>
                  </div>
                  {kennel.TransactionID && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                      <p className="text-gray-900 font-mono text-sm">{kennel.TransactionID}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Date</p>
                    <p className="text-gray-900">{formatDate(kennel.IssueDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {kennel.Notes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{kennel.Notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>Thank you for licensing your kennel!</p>
              <p className="mt-1">For questions, please contact the Dog Licensing Department</p>
              <p className="mt-4 text-xs">Receipt generated on {formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            Kennel license not found
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-wrap gap-3 justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Close
          </button>
          
          <div className="flex gap-3">
            {isExpired && onRenew && (
              <button
                onClick={() => {
                  onClose();
                  onRenew();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Renew Kennel License
              </button>
            )}
            
            <button
              onClick={handlePrintReceipt}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .fixed > .bg-white {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .fixed > .bg-white * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
};

export default KennelDetailsModal;