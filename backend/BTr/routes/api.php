<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\PdfParserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\AdminUser;
use App\Models\ServiceUser;


    // inventory route
    Route::get('/inventory', [EquipmentController::class, 'index']);
    Route::post('/inventory', [EquipmentController::class, 'store']);

    // call parse_pdf.py
    Route::post("/parse-pdf", [PdfParserController::class, 'parse']);

    // edit item
    Route::put('/inventory/{id}', [EquipmentController::class, 'update']);

    // delete item
    Route::delete('/inventory/{id}', [EquipmentController::class, 'destroy']);

    // maintenance schedule route
    Route::post('/maintenance-schedule', [MaintenanceScheduleController::class, 'store']);
    // fetch maintenance schedule for admin
    Route::post('/maintenance-schedule', [MaintenanceScheduleController::class, 'index']);
    // fetch maintenance schedule for service provider
    Route::post('/maintenance-schedule', [MaintenanceScheduleController::class, 'forService']);

    // returns currently logged-in user

    Route::middleware([
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    \Illuminate\Session\Middleware\StartSession::class,
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    ])->get('/user', function (Request $request) {
        $user = Auth::guard('admin_api')->user() ?? Auth::guard('service_api')->user();

        if (!$user) {
            return response()->json(null, 401);
        }

        $role = $user instanceof AdminUser ? 'admin' : 'service';

        return response()->json([
            'user' => array_merge($user->toArray(), ['role' => $role]),
        ]);
    });