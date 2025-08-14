<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\ServiceAuthController;

// web.php
// admin
Route::post('/admin/register', [AdminAuthController::class, 'register']);
Route::post('/admin/login', [AdminAuthController::class, 'login']);

// service
Route::post('/service/register', [ServiceAuthController::class, 'register']);
Route::post('/service/login', [ServiceAuthController::class, 'login']);

// logout
Route::post('/logout', [AdminAuthController::class, 'logout']);
