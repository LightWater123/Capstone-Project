<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\PdfParserController;


    // inventory route
    Route::get('/inventory', [EquipmentController::class, 'index']);
    Route::post('/inventory', [EquipmentController::class, 'store']);

    // call parse_pdf.py
    Route::post("/parse-pdf", [PdfParserController::class, 'parse']);