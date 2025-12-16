import React from 'react';
import { License } from '../types';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: License | null;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  license
}) => {
  if (!isOpen || !license) return null;

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

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    // This would generate a PDF receipt
    // For now, we'll use the print functionality
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg print:bg-white print:text-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-2 print:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-xl font-bold">Payment Details & Receipt</h2>
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

        {/* Receipt Content */}
        <div className="px-6 py-6">
          {/* Header Info */}
          <div className="text-center mb-6 pb-4 border-b-2 border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Dog License Payment Receipt</h1>
            <p className="text-sm text-gray-600 mt-1">City Dog Licensing Department</p>
          </div>

          {/* License Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">License Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">License Number</p>
                <p className="text-gray-900 font-medium">{license.LicenseNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tag Number</p>
                <p className="text-gray-900 font-medium">{license.TagNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Issue Date</p>
                <p className="text-gray-900">{formatDate(license.IssueDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">License Type</p>
                <p className="text-gray-900">{license.LicenseType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  license.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {license.Status}
                </span>
              </div>
            </div>
          </div>

          {/* Dog & Owner Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Dog & Owner Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Dog Name</p>
                <p className="text-gray-900">{license.DogName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Breed</p>
                <p className="text-gray-900">{license.Breed || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Owner Name</p>
                <p className="text-gray-900">{license.FirstName} {license.LastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Contact</p>
                <p className="text-gray-900 text-sm">{license.Email}</p>
                <p className="text-gray-900 text-sm">{license.Phone}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Payment Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount Paid</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(license.Fee)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <span className={`mt-1 px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getPaymentStatusColor(license.PaymentStatus || 'Completed')}`}>
                    {license.PaymentStatus || 'Completed'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="text-gray-900">{license.PaymentMethod || 'N/A'}</p>
                </div>
                {license.TransactionId && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                    <p className="text-gray-900 font-mono text-sm">{license.TransactionId}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Date</p>
                  <p className="text-gray-900">{formatDate(license.PaymentDate || license.IssueDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {license.Notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{license.Notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Thank you for licensing your dog!</p>
            <p className="mt-1">For questions, please contact the Dog Licensing Department</p>
            <p className="mt-4 text-xs">Receipt generated on {formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-wrap gap-3 justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Close
          </button>
          <button
            onClick={handleDownloadReceipt}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Receipt
          </button>
          <button
            onClick={handlePrintReceipt}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Receipt
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed, .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:text-gray-900 {
            color: #111827 !important;
          }
          .print\\:text-blue-600 {
            color: #2563eb !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentDetailsModal;