import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

export default function ServiceMessages() {
  const location = useLocation(); // Get navigation state from previous route
  const navigate = useNavigate();
  const { user } = useAuth();

  // Extract serviceEmail from route state, fallback to default if not provided
  const serviceEmail = location.state?.serviceEmail || 'maintenance@company.com';

  const [messages, setMessages] = useState([]); // Store fetched messages
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Logged-in user: ', user);
    // Fetch messages from Laravel backend using serviceEmail as query param
    if(!user?.email) return;

    fetch('http://localhost:8000/api/maintenance-schedule/service', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch messages: ', err);
        setLoading(false);
      })

      
  }, [user]);


return (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Received Messages</h2>

    <button
    onClick={() => navigate('/service/dashboard')}
    className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
    >
    Back to Dashboard
    </button>

    {loading ? (
      <p>Loading messages...</p>
    ) : messages.length === 0 ? (
      <p>No messages found for {serviceEmail}</p>
    ) : (
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Equipment</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Contact</th>
            <th className="px-4 py-2 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <tr key={msg._id} className="border-t">
              <td className="px-4 py-2">{msg.equipment_id}</td>
              <td className="px-4 py-2">{new Date(msg.scheduled_date).toLocaleString()}</td>
              <td className="px-4 py-2">{msg.contact_name} ({msg.contact_email})</td>
              <td className="px-4 py-2">{msg.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

}
