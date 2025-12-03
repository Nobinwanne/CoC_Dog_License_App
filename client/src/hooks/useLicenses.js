// client/src/hooks/useLicenses.js
import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useLicenses = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all licenses
  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/licenses`);
      if (!response.ok) {
        throw new Error('Failed to fetch licenses');
      }
      const data = await response.json();
      setLicenses(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching licenses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Search licenses
  const searchLicenses = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return fetchLicenses();
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/licenses/search/${searchTerm}`);
      if (!response.ok) {
        throw new Error('Failed to search licenses');
      }
      const data = await response.json();
      setLicenses(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error searching licenses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchLicenses]);

  // Get expiring licenses
  const fetchExpiringLicenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/licenses/status/expiring`);
      if (!response.ok) {
        throw new Error('Failed to fetch expiring licenses');
      }
      const data = await response.json();
      setLicenses(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching expiring licenses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new license
  const createLicense = useCallback(async (licenseData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/licenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(licenseData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create license');
      }

      const result = await response.json();
      // Refresh licenses after creation
      await fetchLicenses();
      return result;
    } catch (err) {
      console.error('Error creating license:', err);
      throw err;
    }
  }, [fetchLicenses]);

  // Update license
  const updateLicense = useCallback(async (id, licenseData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/licenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(licenseData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update license');
      }

      const result = await response.json();
      // Refresh licenses after update
      await fetchLicenses();
      return result;
    } catch (err) {
      console.error('Error updating license:', err);
      throw err;
    }
  }, [fetchLicenses]);

  // Renew license
  const renewLicense = useCallback(async (id, renewalData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/licenses/${id}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(renewalData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to renew license');
      }

      const result = await response.json();
      // Refresh licenses after renewal
      await fetchLicenses();
      return result;
    } catch (err) {
      console.error('Error renewing license:', err);
      throw err;
    }
  }, [fetchLicenses]);

  // Delete license
  const deleteLicense = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/licenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete license');
      }

      // Refresh licenses after deletion
      await fetchLicenses();
      return true;
    } catch (err) {
      console.error('Error deleting license:', err);
      throw err;
    }
  }, [fetchLicenses]);

  // Calculate statistics
  const getStatistics = useCallback(() => {
    return {
      total: licenses.length,
      active: licenses.filter((l) => l.Status === 'Active').length,
      expiring: licenses.filter((l) => l.Status === 'Expiring').length,
      expired: licenses.filter((l) => l.Status === 'Expired').length,
    };
  }, [licenses]);

  // Filter licenses by status
  const filterByStatus = useCallback((status) => {
    if (status === 'all') {
      return licenses;
    }
    const statusMap = {
      active: 'Active',
      expiring: 'Expiring',
      expired: 'Expired',
    };
    return licenses.filter((l) => l.Status === statusMap[status]);
  }, [licenses]);

  // Initial fetch on mount
  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  return {
    licenses,
    loading,
    error,
    fetchLicenses,
    searchLicenses,
    fetchExpiringLicenses,
    createLicense,
    updateLicense,
    renewLicense,
    deleteLicense,
    getStatistics,
    filterByStatus,
  };
};

export default useLicenses;