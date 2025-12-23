// client/src/services/api.ts

// const API_BASE_URL =
//   import.meta.env.VITE_API_URL || "http://localhost:5030/api";
const API_BASE_URL = "/doglicenseapp/api";

// Generic fetch wrapper with error handling
const fetchWithErrorHandling = async (
  url: string,
  options: RequestInit = {}
) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "An error occurred");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// License API
export const licenseAPI = {
  getAll: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses`);
  },

  getById: async (id: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses/${id}`);
  },

  search: async (searchTerm: string) => {
    return fetchWithErrorHandling(
      `${API_BASE_URL}/licenses/search/${searchTerm}`
    );
  },

  create: async (licenseData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses`, {
      method: "POST",
      body: JSON.stringify(licenseData),
    });
  },

  update: async (id: number, licenseData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(licenseData),
    });
  },

  renew: async (id: number, renewalData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses/${id}/renew`, {
      method: "POST",
      body: JSON.stringify(renewalData),
    });
  },

  delete: async (id: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/licenses/${id}`, {
      method: "DELETE",
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

  getWithDogs: async (id: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/owners/${id}/dogs`);
  },

  create: async (ownerData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/owners`, {
      method: "POST",
      body: JSON.stringify(ownerData),
    });
  },

  update: async (id: number, ownerData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/owners/${id}`, {
      method: "PUT",
      body: JSON.stringify(ownerData),
    });
  },

  delete: async (id: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/owners/${id}`, {
      method: "DELETE",
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
      method: "POST",
      body: JSON.stringify(dogData),
    });
  },

  update: async (id: any, dogData: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/dogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(dogData),
    });
  },

  delete: async (id: any) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/dogs/${id}`, {
      method: "DELETE",
    });
  },
};

// Tag API
export const tagAPI = {
  getAll: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/tags`);
  },
};

// Kennel API
export const kennelAPI = {
  getAll: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/kennels`);
  },

  getById: async (id: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/kennels/${id}`);
  },

  getByOwnerId: async (ownerId: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/kennels/owner/${ownerId}`);
  },

  checkEligibility: async (ownerId: number) => {
    return fetchWithErrorHandling(
      `${API_BASE_URL}/kennels/check-eligibility/${ownerId}`
    );
  },

  create: async (data: {
    ownerId: number;
    kennelLicenseNumber: string;
    issueYear: string;
    issueDate: string;
    fee: number;
    paymentMethod: string;
    transactionId: string | null;
    paymentStatus: string;
    notes: string;
  }) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/kennels`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: number,
    data: {
      status?: string;
      notes?: string;
      paymentStatus?: string;
    }
  ) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/kennels/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/kennels/${id}`, {
      method: "DELETE",
    });
  },
};

export default {
  license: licenseAPI,
  owner: ownerAPI,
  dog: dogAPI,
  tag: tagAPI,
  kennel: kennelAPI,
};
