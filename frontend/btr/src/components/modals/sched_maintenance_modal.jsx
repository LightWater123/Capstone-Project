import { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

export default function ScheduleMaintenanceModal({ isOpen, onClose, equipmentId, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    contact_number: '',
    email: '',
    message: '',
    date: '',
    time: '',
  });

  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!equipmentId) {
      setSubmitError('No equipment selected.');
      return;
    }

    try {
      const scheduledDate = format(new Date(`${form.date}T${form.time}`), 'yyyy-MM-dd HH:mm:ss');

      const payload = {
        equipment_id: equipmentId,
        scheduled_date: scheduledDate,
        contact_name: form.name,
        contact_number: form.contact_number,
        email: form.email,
        notes: form.message,
      };

      console.log('Submitting payload:', payload); // ✅ Debug log

      await axios.post('http://localhost:8000/api/maintenance-schedule', payload, {
        withCredentials: true,
      });

      alert('Maintenance scheduled successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Validation errors:', err.response?.data?.errors || err.message);
      setSubmitError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">Schedule Maintenance</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5 text-sm text-gray-800">
          <div className="space-y-3">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              required
              className="w-full border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="contact_number"
              value={form.contact_number}
              onChange={handleChange}
              placeholder="Contact Number"
              required
              className="w-full border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Message"
              rows="3"
              className="w-full border border-black rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
