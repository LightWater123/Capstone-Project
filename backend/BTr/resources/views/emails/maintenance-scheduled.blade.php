<h2>Maintenance Request</h2>
<p><strong>Equipment ID:</strong> {{ $data['equipment_id'] }}</p>
<p><strong>Scheduled Date:</strong> {{ \Carbon\Carbon::parse($data['scheduled_date'])->format('F j, Y g:i A') }}</p>
<p><strong>Name:</strong> {{ $data['contact_name'] }}</p>
<p><strong>Phone:</strong> {{ $data['contact_number'] }}</p>
<p><strong>Email:</strong> {{ $data['contact_email'] }}</p>
<p><strong>Message:</strong> {{ $data['notes'] }}</p>
