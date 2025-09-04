<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\MaintenanceSchedule;
use App\Mail\MaintenanceScheduled;


class MaintenanceScheduleController extends Controller
{
    public function store(Request $request)
    {
        // validate incoming request data
        $validated = $request->validate([
        'equipment_id' => 'required|string',
        'scheduled_date' => 'required|date',
        'contact_name' => 'required|string|max:255',
        'contact_number' => 'required|string|max:20',
        'email' => 'required|email|max:255',
        'notes' => 'nullable|string',
    ]);

    // If the email belongs to a service user, normalize it to their account email
    $serviceUser = \App\Models\User::where('email', $validated['email'])
        ->where('role', 'service') // adjust if you have a role column
        ->first();

    if ($serviceUser) {
        $validated['email'] = $serviceUser->email; // exact match from DB
    }

    $validated['status'] = 'pending';

    $schedule = MaintenanceSchedule::create($validated);

    // Log the email that was stored
    
    Log::info('Schedule created for email:', ['email' => $schedule->email]);
    try {
        Mail::to($validated['email'])->send(new MaintenanceScheduled($validated));
    } catch (\Exception $e) {
        Log::error('Failed to send maintenance schedule email: ' . $e->getMessage());
        return response()->json([
            'message' => 'Maintenance schedule created but failed to send email.',
            'data' => $schedule,
            'error' => $e->getMessage(),
        ], 202);
    }

    return response()->json([
        'message' => 'Maintenance schedule created and email sent.',
        'data' => $schedule
    ], 201);
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
        $user = Auth::guard('service_api')->user();

        if (!$user) {
            return response()->json([], 401);
        }
        Log::info('Service user:', ['email' => optional($user)->email]);

        $schedules = MaintenanceSchedule::where('email', $user->email)
            ->orderBy('scheduled_date', 'desc')
            ->get();

        return response()->json($schedules);

    }
}
