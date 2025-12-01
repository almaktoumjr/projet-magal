<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\EventController;
use App\Http\Controllers\API\PilgrimController;
use App\Http\Controllers\API\PointInterestController;
use App\Http\Controllers\API\StatsController;
use App\Http\Controllers\API\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Auth
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

// Stats
Route::get('/stats', [StatsController::class, 'index']);

// Events
Route::apiResource('events', EventController::class);

// Pilgrims
Route::apiResource('pilgrims', PilgrimController::class);

// Points of Interest
Route::apiResource('points-interest', PointInterestController::class);

// Route pour récupérer les événements à venir
Route::get('/upcoming-events', function () {
    return \App\Models\Event::where('active', true)
                           ->where('date', '>=', now()->toDateString())
                           ->orderBy('date', 'asc')
                           ->orderBy('heure', 'asc')
                           ->limit(5)
                           ->get();
});