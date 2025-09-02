<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\MaintenanceSchedule;
use App\Mail\MaintenanceScheduled;

use Illuminate\Http\Request;

class MaintenanceScheduleController extends Controller
{
    public function store(Request $request)
    {
        // Validate incoming request data
        $validated = $request->validate([
            'equipment_id' => 'required|string',
            'scheduled_date' => 'required|date',
            'contact_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'notes' => 'nullable|string',
            'status' => 'required|string|in:pending,completed,cancelled',
        ]);

        // Create new maintenance schedule entry
        $schedule = MaintenanceSchedule::create($validated);

        try 
        {
            // Send email notification
            Mail::to($validated['email'])->send(new MaintenanceScheduled($validated));
        } catch (\Exception $e) 
        {
            Log::error('Failed to send maintenance schedule email: ' . $e->getMessage());
            
            return response () -> json([
                'message' => 'Maintenance schedule created but failed to send email.', 
                'data' => $schedule,
                'error' => $e->getMessage(),
            ], 202);
        }
        

        return response()->json(['message' => 'Maintenance schedule created and email sent.', 'data' => $schedule], 201);
    }

    // display messages to the frontend
    public function index()
    {
        $schedules = MaintenanceSchedule::orderBy('scheduled_date', 'desc')->get();
        return response()->json($schedules);
    }

    // for service provider to view their scheduled maintenances
    public function forService(Request $request)
    {
        $email = $request->query('email');

        $schedules = MaintenanceSchedule::where('email', $email)
            ->orderBy('scheduled_date', 'desc')
            ->get();
        return response()->json($schedules);
    }
}
