<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\AdminUser;

class AdminAuthController extends Controller
{
    // Admin registration
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username'      => 'required|string|max:255',
            'email'         => 'required|email|unique:admin_users,email',
            'password'      => 'required|string|min:6',
            'mobile_number' => 'required|string|max:20',
        ]);

        // Keep only digits in mobile number
        $digitsOnly = preg_replace('/\D+/', '', $validated['mobile_number']);

        if (strlen($digitsOnly) === 11) {
            $validated['mobile_number'] = substr($digitsOnly, 0, 4) . '-' .
                                          substr($digitsOnly, 4, 3) . '-' .
                                          substr($digitsOnly, 7);
        } else {
            return response()->json([
                'error' => 'Mobile number must contain exactly 11 digits.'
            ], 422);
        }

        $admin = AdminUser::create([
            'username'      => $validated['username'],
            'email'         => $validated['email'],
            'password'      => Hash::make($validated['password']),
            'mobile_number' => $validated['mobile_number'],
        ]);

        return response()->json([
            'message' => 'Account registered successfully.',
            'user'    => array_merge($admin->toArray(), ['role' => 'admin']),
        ], 201);
    }

    // Admin Login
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required'
        ]);

        $loginType = filter_var($request->username, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        // login using guard auth
        if (Auth::attempt([$loginType => $request->username, 'password' => $request->password])) {
            $request->session()->regenerate();

            return response()->json([
                'message' => 'Login successful',
                'user'    => array_merge(Auth::user()->toArray(), ['role' => 'admin'])
            ]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // logout
    public function logout(Request $request)
    {
        Auth::guard()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }
}
