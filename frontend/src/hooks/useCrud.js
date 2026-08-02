import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

/**
 * Generic CRUD hook for any section endpoint.
 * @param {string} endpoint - API endpoint path (e.g., '/education')
 */
export default function useCrud(endpoint) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(endpoint);
      setItems(res.data);
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = async (data) => {
    setSaving(true);
    try {
      const res = await API.post(endpoint, data);
      setItems((prev) => [...prev, res.data]);
      return res.data;
    } finally {
      setSaving(false);
    }
  };

  const updateItem = async (id, data) => {
    setSaving(true);
    try {
      const res = await API.put(`${endpoint}/${id}`, data);
      setItems((prev) => prev.map((item) => (item.id === id ? res.data : item)));
      return res.data;
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id) => {
    setSaving(true);
    try {
      await API.delete(`${endpoint}/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setSaving(false);
    }
  };

  return { items, loading, saving, fetchItems, createItem, updateItem, deleteItem };
}
