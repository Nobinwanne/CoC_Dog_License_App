import React, { useState, useEffect } from "react";
import { dogAPI, ownerAPI } from "../services/api";
import { Owner, AddDogFormProps } from "../types";

const AddDogForm: React.FC<AddDogFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    ownerId: "",
    ownerName: "",
    dogName: "",
    roll: "",
    breed: "",
    color: "",
    dateOfBirth: "",
    gender: "Male",
    isSpayedNeutered: false,
    isNuisance: false,
    isServiceDog: false, // NEW
    isDangerous: false, // NEW
  });

  useEffect(() => {
    if (isOpen) {
      loadOwners();
    }
  }, [isOpen]);

  const loadOwners = async () => {
    try {
      const data = await ownerAPI.getAll();
      setOwners(data);
    } catch (err) {
      console.error("Error loading owners:", err);
    }
  };

  const filteredOwners = owners.filter((owner) => {
    const search = searchTerm.toLowerCase();
    return (
      owner.FirstName?.toLowerCase().includes(search) ||
      owner.LastName?.toLowerCase().includes(search) ||
      owner.Email?.toLowerCase().includes(search)
    );
  });

  const handleOwnerSelect = (owner: Owner) => {
    setFormData((prev) => ({
      ...prev,
      ownerId: owner.OwnerID.toString(),
      ownerName: `${owner.FirstName} ${owner.LastName}`,
    }));
    setSearchTerm("");
    setShowOwnerDropdown(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "roll" && type === "text") {
      // Only allow numbers for roll
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, roll: numericValue }));
      return;
    }

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // If unchecking isNuisance, also uncheck isDangerous
      if (name === "isNuisance" && !checked) {
        newData.isDangerous = false;
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate
      if (!formData.ownerId) {
        throw new Error("Please select an owner");
      }
      if (!formData.dogName.trim()) {
        throw new Error("Dog name is required");
      }

      // Prepare data for API
      const dogData = {
        ownerId: parseInt(formData.ownerId),
        dogName: formData.dogName.trim(),
        roll: formData.roll,
        breed: formData.breed.trim() || null,
        color: formData.color.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        isSpayedNeutered: formData.isSpayedNeutered,
        isNuisance: formData.isNuisance,
        isServiceDog: formData.isServiceDog, // NEW
        isDangerous: formData.isDangerous, // NEW
      };

      await dogAPI.create(dogData);

      setSuccess(true);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after delay
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register dog");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ownerId: "",
      ownerName: "",
      dogName: "",
      breed: "",
      roll: "",
      color: "",
      dateOfBirth: "",
      gender: "Male",
      isSpayedNeutered: false,
      isNuisance: false,
      isServiceDog: false, // NEW
      isDangerous: false, // NEW
    });
    setSearchTerm("");
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black opacity-30"
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 z-50">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Register New Dog
            </h2>
            <button
              onClick={handleClose}
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

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-medium">Dog registered successfully!</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Owner Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner <span className="text-red-500">*</span>
              </label>

              {formData.ownerName ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="font-medium text-blue-900">
                    {formData.ownerName}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        ownerId: "",
                        ownerName: "",
                      }))
                    }
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for owner by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowOwnerDropdown(true);
                    }}
                    onFocus={() => setShowOwnerDropdown(true)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />

                  {/* Owner Dropdown */}
                  {showOwnerDropdown && filteredOwners.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredOwners.map((owner) => (
                        <button
                          key={owner.OwnerID}
                          type="button"
                          onClick={() => handleOwnerSelect(owner)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 transition"
                        >
                          <div className="font-medium text-gray-900">
                            {owner.FirstName} {owner.LastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {owner.Email}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dog Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dog Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="dogName"
                value={formData.dogName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter dog's name"
              />
            </div>

            {/* Roll */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="roll"
                value={formData.roll}
                onChange={(e) => {
                  //only allow numbers
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setFormData((prev) => ({ ...prev, roll: value }));
                }}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter Roll number where dog lives"
                inputMode="numeric"
              />
              <p className="text-xs text-gray-500 mt-1">Numbers only</p>
            </div>

            {/* Breed and Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Labrador Retriever"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Golden"
                />
              </div>
            </div>

            {/* Date of Birth and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isSpayedNeutered"
                  checked={formData.isSpayedNeutered}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Spayed/Neutered
                </span>
                <label className="ml-2 flex items-center">
                  <input
                    type="checkbox"
                    name="isServiceDog"
                    checked={formData.isServiceDog}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Service Dog
                  </span>
                </label>

                {formData.isServiceDog && (
                  <p className="ml-6 text-xs text-green-600 font-medium">
                    ✓ Service dogs are licensed at no charge (lifetime)
                  </p>
                )}
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isNuisance"
                  checked={formData.isNuisance}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Nuisance Dog</span>
              </label>
              {formData.isNuisance && (
                <div className="ml-6 mt-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isDangerous"
                      checked={formData.isDangerous}
                      onChange={handleChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Dangerous Dog
                    </span>
                  </label>
                  {formData.isDangerous ? (
                    <p className="ml-6 text-xs text-red-600 font-medium">
                      ⚠ Dangerous dogs require annual license renewal
                      ($100/year)
                    </p>
                  ) : (
                    <p className="ml-6 text-xs text-orange-600">
                      Nuisance (non-dangerous) dogs: $60 lifetime license
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : success ? (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Registered
                  </>
                ) : (
                  "Register Dog"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDogForm;
