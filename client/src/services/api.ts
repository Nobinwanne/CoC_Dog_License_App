// client/src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5030/api';


// Generic fetch wrapper with error handling
const fetchWithErrorHandling = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'An error occurred');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// License API
export const licenseAPI = {
  // Get all licenses
  getAll: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses`);
  },

  // Get license by ID
  getById: async (id: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses/${id}`);
  },

  // Search licenses
  search: async (searchTerm: string) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses/search/${searchTerm}`);
  },

  // Get expiring licenses
  getExpiring: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses/status/expiring`);
  },

  // Create new license
  create: async (licenseData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses`, {
      method: 'POST',
      body: JSON.stringify(licenseData),
    });
  },

  // Update license
  update: async (id: number, licenseData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(licenseData),
    });
  },

  // Renew license
  renew: async (id: number, renewalData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify(renewalData),
    });
  },

  // Delete license
  delete: async (id: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses/${id}`, {
      method: 'DELETE',
    });
  },
};

// Owner API
export const ownerAPI = {
  getAll: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/owners`);
  },

  getById: async (id: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/owners/${id}`);
  },

  create: async (ownerData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/owners`, {
      method: 'POST',
      body: JSON.stringify(ownerData),
    });
  },

  update: async (id: number, ownerData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/owners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ownerData),
    });
  },

  delete: async (id: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/owners/${id}`, {
      method: 'DELETE',
    });
  },
};

// Dog API
export const dogAPI = {
  getAll: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/dogs`);
  },

  getById: async (id: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/dogs/${id}`);
  },

  getByOwner: async (ownerId: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/dogs/owner/${ownerId}`);
  },

  create: async (dogData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/dogs`, {
      method: 'POST',
      body: JSON.stringify(dogData),
    });
  },

  update: async (id: any, dogData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/dogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dogData),
    });
  },

  delete: async (id: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/dogs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Payment API
export const paymentAPI = {
  getAll: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/payments`);
  },

  getByLicense: async (licenseId: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/payments/license/${licenseId}`);
  },

  create: async (paymentData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

    // Get payment statistics
  getStatistics: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/payments/statistics/summary`);
  },
};

export default {
  license: licenseAPI,
  owner: ownerAPI,
  dog: dogAPI,
  payment: paymentAPI,
};