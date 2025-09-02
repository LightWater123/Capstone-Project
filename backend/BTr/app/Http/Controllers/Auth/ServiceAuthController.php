<?php

namespace App\Http\Controllers\Auth;
    
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\ServiceUser;

    class ServiceAuthController extends Controller
    {
        // service user registration

        public function register(Request $request)
        {
            try{
                
                // validate registration request
            $validated = $request->validate([
                'username'     => 'required|string|max:255',
                'email'        => 'required|email|unique:service_users,email',
                'password'     => 'required|string|min:6',
                'mobile_number'=> 'required|string|max:20',
                'address'      => 'required|string|max:500',
                'service_type' => 'required|in:Vehicle,Appliances,ICT Equipment',
            ]);

            // take in numeric characters for mobile number
            $digitsOnly = preg_replace('/\D+/', '', $validated['mobile_number']);

            // format mobile number as 0912-345-6789 example
            if (strlen($digitsOnly) === 11) {
                $formattedMobile = substr($digitsOnly, 0, 4) . '-' . substr($digitsOnly, 4, 3) . '-' . substr($digitsOnly, 7);
                $validated['mobile_number'] = $formattedMobile;
            } else {
                // return validation error if length is incorrect
                return response()->json([
                    'error' => 'Mobile number must contain exactly 11 digits.'
                ], 422);
            }

            // create new service_user account using ServiceUser model
            $serviceUser = ServiceUser::create([
                'username'     => $validated['username'],
                'email'        => $validated['email'],
                'password'     => Hash::make($validated['password']),
                'mobile_number' => $validated['mobile_number'],
                'address'      => $validated['address'],
                'service_type' => $validated['service_type'],
            ]);

            // return JSON with role
            return response()->json([
                'message' => 'Account registered successfully.',
                'user' => array_merge($serviceUser->toArray(), ['role' => 'service']), // add role
            ], 201);

            } catch (\Illuminate\Validation\ValidationException $e) {
                // handle validation errors
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors'   => $e->errors(),
                ], 422);
                
            } catch (\Exception $e) {
                // handle other errors
                return response()->json([
                    'message' => 'Registration Failed.',
                    'error'   => $e->getMessage(),
                ], 500);
            }
            
        }

        // service_user login

        public function login(Request $request)
        {
            
            try
            {
                // validate credentials
            $credentials = $request->validate([
                'username'    => 'required|string',
                'password' => 'required|string',
            ]);

            // login attempt using guard
            if (!Auth::guard('service_api')->attempt($credentials)) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            // get authenticated service user
            $user = Auth::guard('service_api')->user();
            $request->session()->regenerate();

            // return logged in user with token
            return response()->json([
                'message' => 'Login successful',
                'user'    => array_merge($user->toArray(), ['role' => 'service']),
                
            ]);
            }catch(\Exception $e)
            {
                return response()->json([
                    'error'   => 'Login failed',
                    'details' => $e->getMessage(),
                ], 500);
            }
            
        }
        // service user logout
        public function logout(Request $request)
        {
            try{

            Auth::guard('service_api')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            // logout message
            return response()->json([
                'message' => 'Logged out successfully.',
            ]);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Logout failed.',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }
    }