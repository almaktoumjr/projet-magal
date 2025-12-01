<?php
// StatsController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Pilgrim;
use App\Models\PointInterest;

class StatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'pilgrims' => Pilgrim::count(),
            'events' => Event::where('active', true)->count(),
            'points' => PointInterest::where('active', true)->count()
        ]);
    }
}