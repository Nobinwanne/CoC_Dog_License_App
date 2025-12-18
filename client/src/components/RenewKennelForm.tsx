import React, { useState, useEffect } from 'react';
import { kennelAPI } from '../services/api';
import { KennelDetails, RenewKennelFormProps } from '../types';



const RenewKennelForm: React.FC<RenewKennelFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  kennelId
}) => {
  const [kennel, setKennel] = useState<KennelDetails | null>(null);
  const [formData, setFormData] = useState({
    newKennelLicenseNumber: '',
    issueYear: new Date().getFullYear().toString(),
    issueDate: new Date().toISOString().split('T')[0],
    fee: '100.00',
    paymentMethod: 'Cash',
    transactionId: '',
    paymentStatus: 'Completed',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingKennel, setLoadingKennel] = useState(true);

  useEffect(() => {
    if (isOpen && kennelId) {
      loadKennelDetails();
    }
  }, [isOpen, kennelId]);

  // Auto-update issueYear when issueDate changes
  useEffect(() => {
    if (formData.issueDate) {
      const year = new Date(formData.issueDate).getFullYear().toString();
      if (year !== formData.issueYear) {
        setFormData(prev => ({
          ...prev,
          issueYear: year
        }));
      }
    }
  }, [formData.issueDate]);

  const loadKennelDetails = async () => {
    if (!kennelId) return;
    
    try {
      setLoadingKennel(true);
      const data = await kennelAPI.getById(kennelId);
      setKennel(data);
      
      // Generate new license number suggestion
      const newNumber = data.KennelLicenseNumber.replace(
        data.IssueYear,
        new Date().getFullYear().toString()
      );
      
      setFormData(prev => ({
        ...prev,
        newKennelLicenseNumber: newNumber
      }));
    } catch (err) {
      console.error('Error loading kennel:', err);
      setError('Failed to load kennel details');
    } finally {
      setLoadingKennel(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kennel) {
      setError('Kennel information not loaded');
      return;
    }

    if (!formData.newKennelLicenseNumber.trim()) {
      setError('New Kennel License Number is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create new kennel license (renewal)
      await kennelAPI.create({
        ownerId: kennel.OwnerID,
        kennelLicenseNumber: formData.newKennelLicenseNumber,
        issueYear: formData.issueYear,
        issueDate: formData.issueDate,
        fee: parseFloat(formData.fee),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId || null,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes
      });

      // Update old kennel status to Expired
      if (kennelId) {
        await kennelAPI.update(kennelId, {
          status: 'Expired'
        });
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to renew kennel license');
      console.error('Error renewing kennel license:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        newKennelLicenseNumber: '',
        issueYear: new Date().getFullYear().toString(),
        issueDate: new Date().toISOString().split('T')[0],
        fee: '100.00',
        paymentMethod: 'Cash',
        transactionId: '',
        paymentStatus: 'Completed',
        notes: ''
      });
      setError(null);
      setKennel(null);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <h2 className="text-xl font-bold">Renew Kennel License</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-white hover:text-gray-200 transition disabled:opacity-50"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {loadingKennel ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : kennel ? (
            <>
              {/* Info Banner */}
              <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-green-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Renewing Kennel License</p>
                    <p className="mt-1">This will create a new kennel license for another year and mark the old one as expired.</p>
                  </div>
                </div>
              </div>

              {/* Previous License Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Previous License Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Owner:</p>
                    <p className="font-medium">{kennel.FirstName} {kennel.LastName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dogs Covered:</p>
                    <p className="font-medium">{kennel.NumberOfDogs} dogs</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Old License Number:</p>
                    <p className="font-medium">{kennel.KennelLicenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expired On:</p>
                    <p className="font-medium text-red-600">{formatDate(kennel.ExpiryDate)}</p>
                  </div>
                </div>
              </div>

              {/* New License Information */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">New License Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Kennel License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="newKennelLicenseNumber"
                      value={formData.newKennelLicenseNumber}
                      onChange={handleChange}
                      required
                      placeholder="e.g., KNL-2025-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="issueYear"
                      value={formData.issueYear}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated from Issue Date</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">Payment Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Renewal Fee <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="fee"
                        value={formData.fee}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Check">Check</option>
                      <option value="Money Order">Money Order</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction ID / Reference Number
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Optional notes about this renewal..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Kennel license not found
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-wrap gap-3 justify-between pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading || loadingKennel || !kennel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Renew Kennel License
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenewKennelForm;