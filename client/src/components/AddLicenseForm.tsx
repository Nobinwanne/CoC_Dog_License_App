import React, { useState, useEffect } from 'react';
import { licenseAPI, dogAPI, ownerAPI } from '../services/api';

interface AddLicenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Owner {
  OwnerID: number;
  FirstName: string;
  LastName: string;
  Email: string;
}

interface Dog {
  DogID: number;
  DogName: string;
  Breed: string;
  OwnerID: number;
}

const AddLicenseForm: React.FC<AddLicenseFormProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);
  const [selectedDogId, setSelectedDogId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    tagId: '',
    licenseNumber: '',
    issueYear: new Date().getFullYear().toString(),
    licenseType: 'Lifetime',
    issueDate: new Date().toISOString().split('T')[0],
    fee: '40.00',
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
      loadDogs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedOwnerId) {
      const ownerDogs = dogs.filter(dog => dog.OwnerID === selectedOwnerId);
      setFilteredDogs(ownerDogs);
    }
  }, [selectedOwnerId, dogs]);

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
    } catch (err) {
      console.error('Error loading owners:', err);
      setError('Failed to load owners');
    }
  };

  const loadDogs = async () => {
    try {
      const data = await dogAPI.getAll();
      setDogs(data);
    } catch (err) {
      console.error('Error loading dogs:', err);
      setError('Failed to load dogs');
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
    
    if (!selectedDogId) {
      setError('Please select a dog');
      return;
    }

    // Validate required fields
    if (!formData.tagId.trim()) {
      setError('Tag ID is required');
      return;
    }

    if (!formData.licenseNumber.trim()) {
      setError('License Number is required');
      return;
    }

    if (!formData.issueYear.trim()) {
      setError('Issue Year is required');
      return;
    }

    if (!formData.licenseType.trim()) {
      setError('License Type is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await licenseAPI.create({
        dogId: selectedDogId,
        tagId: formData.tagId,
        licenseNumber: formData.licenseNumber,
        issueYear: formData.issueYear,
        licenseType: formData.licenseType,
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
      setError(err instanceof Error ? err.message : 'Failed to create license');
      console.error('Error creating license:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStep(1);
      setSelectedOwnerId(null);
      setSelectedDogId(null);
      setSearchTerm('');
      setFormData({
        tagId: '',
        licenseNumber: '',
        issueYear: new Date().getFullYear().toString(),
        licenseType: 'Lifetime',
        issueDate: new Date().toISOString().split('T')[0],
        fee: '40.00',
        paymentMethod: 'Cash',
        transactionId: '',
        paymentStatus: 'Completed',
        notes: ''
      });
      setError(null);
      onClose();
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedOwnerId) {
      setError('Please select an owner');
      return;
    }
    if (step === 2 && !selectedDogId) {
      setError('Please select a dog');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const filteredOwners = owners.filter(owner =>
    `${owner.FirstName} ${owner.LastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOwner = owners.find(o => o.OwnerID === selectedOwnerId);
  const selectedDog = dogs.find(d => d.DogID === selectedDogId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 className="text-xl font-bold">Issue New License</h2>
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
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-white' : 'bg-blue-400'}`}></div>
            <div className={`h-0.5 w-8 ${step >= 2 ? 'bg-white' : 'bg-blue-400'}`}></div>
            <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-white' : 'bg-blue-400'}`}></div>
            <div className={`h-0.5 w-8 ${step >= 3 ? 'bg-white' : 'bg-blue-400'}`}></div>
            <div className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-white' : 'bg-blue-400'}`}></div>
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

          {/* Step 1: Select Owner */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Select Owner</h3>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search owners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredOwners.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No owners found</p>
                ) : (
                  filteredOwners.map(owner => (
                    <div
                      key={owner.OwnerID}
                      onClick={() => setSelectedOwnerId(owner.OwnerID)}
                      className={`p-4 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 transition ${
                        selectedOwnerId === owner.OwnerID ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {owner.FirstName} {owner.LastName}
                      </div>
                      <div className="text-sm text-gray-500">{owner.Email}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Select Dog */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Select Dog</h3>
              
              {selectedOwner && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Owner:</p>
                  <p className="font-medium">{selectedOwner.FirstName} {selectedOwner.LastName}</p>
                </div>
              )}

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredDogs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    This owner has no registered dogs
                  </p>
                ) : (
                  filteredDogs.map(dog => (
                    <div
                      key={dog.DogID}
                      onClick={() => setSelectedDogId(dog.DogID)}
                      className={`p-4 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 transition ${
                        selectedDogId === dog.DogID ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{dog.DogName}</div>
                      <div className="text-sm text-gray-500">{dog.Breed}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 3: License Details & Payment */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 3: License Details & Payment</h3>
              
              {/* Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Owner:</p>
                    <p className="font-medium">{selectedOwner?.FirstName} {selectedOwner?.LastName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dog:</p>
                    <p className="font-medium">{selectedDog?.DogName}</p>
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">License Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tag ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="tagId"
                      value={formData.tagId}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 10002"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                      placeholder="e.g., LIC-2025-10002"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                      License Fee <span className="text-red-500">*</span>
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
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Confirmation number, check number, or transaction reference
                    </p>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                  placeholder="Optional notes about this license or payment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-wrap gap-3 justify-between pt-4 border-t">
            <button
              type="button"
              onClick={step === 1 ? handleClose : handlePreviousStep}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              {step === 1 ? 'Cancel' : 'Previous'}
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center"
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
                  'Issue License & Record Payment'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLicenseForm;