import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';

export default function EditItemModal({ isOpen, item, onClose, onSave }) {
  const [form, setForm] = useState({});
  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (item) setForm(item);
  }, [item]);

  useEffect(() => {
  axios.get("http://localhost:8000/sanctum/csrf-cookie", {
    withCredentials: true
  }).then(() => {
    const xsrfToken = Cookie.get("XSRF-TOKEN");
    axios.defaults.headers.common["X-XSRF-TOKEN"] = xsrfToken;
    axios.defaults.withCredentials = true;
    console.log("CSRF setup complete (EditItemModal)");
  }).catch((err) => {
    console.error("Error setting CSRF cookie:", err);
  });
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(`http://localhost:8000/api/inventory/${item.id}`, form); // calls backend api route
      alert('Item updated successfully!');

      if (onSave) onSave(res.data); // Notify parent to refresh data
      onClose();
    } catch (err) {
      alert('Error updating item. Please try again.');
      console.error('Error updating item:', err);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Edit Equipment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 text-sm text-gray-700">
          <div className="space-y-3">
            <input
              type="text"
              name="article"
              value={form.article || ''}
              onChange={handleChange}
              placeholder="Article"
              required
              className="w-full border border-black rounded px-3 py-2"
            />
            <input
              type="text"
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border border-black rounded px-3 py-2"
            />
            {form.category === "PPE" ? (
              <>
                <input
                  type="text"
                  name="property_ro"
                  value={form.property_ro || ''}
                  onChange={handleChange}
                  placeholder="Property No. (RO)"
                  className="w-full border border-black rounded px-3 py-2"
                />
                <input
                  type="text"
                  name="property_co"
                  value={form.property_co || ''}
                  onChange={handleChange}
                  placeholder="Property No. (CO)"
                  className="w-full border border-black rounded px-3 py-2"
                />
              </>
            ) : (
              <input
                type="text"
                name="semi_expendable_property_no"
                value={form.semi_expendable_property_no || ''}
                onChange={handleChange}
                placeholder="Semi-Expendable Property No."
                className="w-full border border-black rounded px-3 py-2"
              />
            )}
            <input
              type="text"
              name="unit"
              value={form.unit || ''}
              onChange={handleChange}
              placeholder="Unit"
              className="w-full border border-black rounded px-3 py-2"
            />
            <input
              type="number"
              name="unit_value"
              value={form.unit_value || ''}
              onChange={handleChange}
              placeholder="Unit Value"
              className="w-full border border-black rounded px-3 py-2"
            />
            <textarea
              name="remarks"
              value={form.remarks || ''}
              onChange={handleChange}
              placeholder="Remarks"
              rows="3"
              className="w-full border border-black rounded px-3 py-2 resize-none"
            />
          </div>

          <div className="space-y-3">
            <input
              type="number"
              name="recorded_count"
              value={form.recorded_count || ''}
              onChange={handleChange}
              placeholder="Balance per Card"
              className="w-full border border-black rounded px-3 py-2"
            />
            <input
              type="number"
              name="actual_count"
              value={form.actual_count || ''}
              onChange={handleChange}
              placeholder="On-hand Count"
              className="w-full border border-black rounded px-3 py-2"
            />
            <input
              type="number"
              name="shortage_or_overage_qty"
              value={form.shortage_or_overage_qty || ''}
              onChange={handleChange}
              placeholder="Shortage/Overage Qty"
              className="w-full border border-black rounded px-3 py-2"
            />
            <input
              type="number"
              name="shortage_or_overage_val"
              value={form.shortage_or_overage_val || ''}
              onChange={handleChange}
              placeholder="Shortage/Overage Value"
              className="w-full border border-black rounded px-3 py-2"
            />
            <select
              name="location"
              value={form.location || ''}
              onChange={handleChange}
              className="w-full border border-black rounded px-3 py-2"
            >
              <option value="">Select Location</option>
              <option value="RD's Office">RD's Office</option>
              <option value="Storage Room">Storage Room</option>  
              <option value="Conference Room">Conference Room</option>
              <option value="Auditor's Office">Auditor's Office</option>
              <option value="Car Port/Garage">Car Port/Garage</option>
              <option value="CTOO II Office">CTOO II Office</option>
              <option value="Records Room">Records Room</option>
              <option value="Outside the building">Outside the building</option>
              <option value="Within the building">Within the building</option>
            </select>
            <select
              name="condition"
              value={form.condition || ''}
              onChange={handleChange}
              className="w-full border border-black rounded px-3 py-2"
            >
              <option value="">Select Condition</option>
              <option value="Serviceable">Serviceable</option>
              <option value="Needs Repair">Needs Repair</option>
              <option value="Unserviceable">Unserviceable</option>
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                name="start_date"
                value={form.start_date || ''}
                onChange={handleChange}
                className="border border-black rounded px-3 py-2"
              />
              <input
                type="date"
                name="end_date"
                value={form.end_date || ''}
                onChange={handleChange}
                className="border border-black rounded px-3 py-2"
              />
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
