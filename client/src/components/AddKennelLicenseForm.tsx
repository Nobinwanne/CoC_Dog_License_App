import React, { useState, useEffect } from 'react';
import { kennelAPI, ownerAPI } from '../services/api';
import {Owner, Dog, AddKennelLicenseFormProps} from '../types'



const AddKennelLicenseForm: React.FC<AddKennelLicenseFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedOwnerId = null
}) => {
  const [step, setStep] = useState(preselectedOwnerId ? 2 : 1);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [eligibleOwners, setEligibleOwners] = useState<Owner[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(preselectedOwnerId);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [ownerDogs, setOwnerDogs] = useState<Dog[]>([]);
  
  const [formData, setFormData] = useState({
    kennelLicenseNumber: '',
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadOwners();
      if (preselectedOwnerId) {
        setSelectedOwnerId(preselectedOwnerId);
        loadOwnerDetails(preselectedOwnerId);
        loadOwnerDogs(preselectedOwnerId);
      }
    }
  }, [isOpen, preselectedOwnerId]);

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

  const loadOwners = async () => {
    try {
      const data = await ownerAPI.getAll();
      setOwners(data);
      
      // Filter owners with 3+ dogs
      const eligible = await Promise.all(
        data.map(async (owner: Owner) => {
          try {
            const dogsResponse = await fetch(`/api/dogs/owner/${owner.OwnerID}`);
            const dogs = await dogsResponse.json();
            return { ...owner, DogCount: dogs.length };
          } catch {
            return { ...owner, DogCount: 0 };
          }
        })
      );
      
      const ownersWithThreePlus = eligible.filter(o => o.DogCount && o.DogCount >= 3);
      setEligibleOwners(ownersWithThreePlus);
    } catch (err) {
      console.error('Error loading owners:', err);
      setError('Failed to load owners');
    }
  };

  const loadOwnerDogs = async (ownerId: number) => {
    try {
      console.log('Loading dogs for owner:', ownerId);
      const ownerData = await ownerAPI.getWithDogs(ownerId);
      console.log('Owner data received:', ownerData);
      
      const dogs = ownerData.dogs || [];
      console.log('Dogs extracted:', dogs.length, 'dogs');
      setOwnerDogs(dogs);
      
      if (dogs.length === 0) {
        setError('This owner has no dogs registered');
      }
    } catch (err) {
      console.error('Error loading owner dogs:', err);
      setError(`Failed to load owner dogs: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const loadOwnerDetails = async (ownerId: number) => {
    try {
      const ownerData = await ownerAPI.getWithDogs(ownerId);
      setSelectedOwner(ownerData);
    } catch (err) {
      console.error('Error loading owner details:', err);
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
    
    if (!selectedOwnerId) {
      setError('Please select an owner');
      return;
    }

    if (!formData.kennelLicenseNumber.trim()) {
      setError('Kennel License Number is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await kennelAPI.create({
        ownerId: selectedOwnerId,
        kennelLicenseNumber: formData.kennelLicenseNumber,
        issueYear: formData.issueYear,
        issueDate: formData.issueDate,
        fee: parseFloat(formData.fee),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId || null,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes
      });

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create kennel license');
      console.error('Error creating kennel license:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStep(preselectedOwnerId ? 2 : 1);
      if (!preselectedOwnerId) {
        setSelectedOwnerId(null);
        setSelectedOwner(null);
      }
      setOwnerDogs([]);
      setSearchTerm('');
      setFormData({
        kennelLicenseNumber: '',
        issueYear: new Date().getFullYear().toString(),
        issueDate: new Date().toISOString().split('T')[0],
        fee: '100.00',
        paymentMethod: 'Cash',
        transactionId: '',
        paymentStatus: 'Completed',
        notes: ''
      });
      setError(null);
      onClose();
    }
  };

  const handleNextStep = async () => {
    if (step === 1 && !selectedOwnerId) {
      setError('Please select an owner');
      return;
    }
    if (step === 1 && selectedOwnerId) {
      await loadOwnerDetails(selectedOwnerId);
      await loadOwnerDogs(selectedOwnerId);
    }
    setError(null);
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const filteredEligibleOwners = eligibleOwners.filter(owner =>
    `${owner.FirstName} ${owner.LastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h2 className="text-xl font-bold">Issue Kennel License</h2>
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
          
          {/* Progress Indicator */}
          {!preselectedOwnerId && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-white' : 'bg-green-400'}`}></div>
              <div className={`h-0.5 w-8 ${step >= 2 ? 'bg-white' : 'bg-green-400'}`}></div>
              <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-white' : 'bg-green-400'}`}></div>
              <div className={`h-0.5 w-8 ${step >= 3 ? 'bg-white' : 'bg-green-400'}`}></div>
              <div className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-white' : 'bg-green-400'}`}></div>
            </div>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Info Banner */}
          <div className="mb-4 bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-green-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-green-800">
                <p className="font-medium">Kennel License - $100.00</p>
                <p>Covers all dogs owned by this owner (minimum 3 dogs required)</p>
              </div>
            </div>
          </div>

          {/* Step 1: Select Owner (only if not preselected) */}
          {!preselectedOwnerId && step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Select Owner (3+ Dogs)</h3>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search eligible owners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredEligibleOwners.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No eligible owners found (need 3+ dogs)
                  </p>
                ) : (
                  filteredEligibleOwners.map(owner => (
                    <div
                      key={owner.OwnerID}
                      onClick={() => setSelectedOwnerId(owner.OwnerID)}
                      className={`p-4 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 transition ${
                        selectedOwnerId === owner.OwnerID ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">
                            {owner.FirstName} {owner.LastName}
                          </div>
                          <div className="text-sm text-gray-500">{owner.Email}</div>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {owner.dogCount} dogs
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Review Dogs */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {preselectedOwnerId ? 'Dogs Covered by Kennel License' : 'Step 2: Review Owner\'s Dogs'}
              </h3>
              
              {selectedOwner && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Owner:</p>
                  <p className="font-medium">{selectedOwner.FirstName} {selectedOwner.LastName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedOwner.dogCount} dogs will be covered under this kennel license
                  </p>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dog Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Breed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tag Number</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ownerDogs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                          Loading dogs...
                        </td>
                      </tr>
                    ) : (
                      ownerDogs.map(dog => (
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
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 3: License Details & Payment */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {preselectedOwnerId ? 'License Details & Payment' : 'Step 3: License Details & Payment'}
              </h3>
              
              {/* Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Owner:</p>
                    <p className="font-medium">{selectedOwner?.FirstName} {selectedOwner?.LastName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dogs Covered:</p>
                    <p className="font-medium">{ownerDogs.length} dogs</p>
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">License Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kennel License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="kennelLicenseNumber"
                      value={formData.kennelLicenseNumber}
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
                      Kennel License Fee <span className="text-red-500">*</span>
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
                  placeholder="Optional notes about this kennel license..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-wrap gap-3 justify-between pt-4 border-t">
            <button
              type="button"
              onClick={step === (preselectedOwnerId ? 2 : 1) ? handleClose : handlePreviousStep}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              {step === (preselectedOwnerId ? 2 : 1) ? 'Cancel' : 'Previous'}
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
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
                  'Issue Kennel License & Record Payment'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddKennelLicenseForm;