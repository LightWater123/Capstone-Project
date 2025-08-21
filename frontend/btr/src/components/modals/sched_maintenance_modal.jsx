import { useState } from 'react';

export default function ScheduleMaintenanceModal({ isOpen, onClose, equipmentId, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    contact_number: '',
    email: '',
    message: '',
    date: '',
    time: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        equipment_id: equipmentId,
        scheduled_date: `${form.date} ${form.time}`,
        contact_name: form.name,
        contact_number: form.contact_number,
        contact_email: form.email,
        notes: form.message,
      };
      await axios.post('/api/maintenance-schedules', payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error scheduling maintenance:', err);
      // Optional: show toast or error message
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Schedule Maintenance</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            name="contact_number"
            value={form.contact_number}
            onChange={handleChange}
            placeholder="Contact Number"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Message"
            className="w-full border rounded px-3 py-2"
          />
          <div className="flex gap-4">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="flex-1 border rounded px-3 py-2"
            />
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="flex-1 border rounded px-3 py-2"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
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
