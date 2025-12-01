<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PointInterest;
use Illuminate\Http\Request;

class PointInterestController extends Controller
{
    public function index()
    {
        // Utiliser le modèle Eloquent qui pointe vers points_of_interest
        $points = PointInterest::all();
        return response()->json($points);
    }
    
    public function store(Request $request)
    {
        // Validation selon la structure de points_of_interest
        $validated = $request->validate([
            'nom' => 'required|string',
            'description' => 'required|string',
            'adresse' => 'required|string',
            'type' => 'required|in:mosquee,restaurant,logement,service',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'active' => 'nullable|boolean'
        ]);

        $point = PointInterest::create($validated);
        return response()->json($point, 201);
    }
    
    public function update(Request $request, $id)
    {
        $point = PointInterest::findOrFail($id);
        
        $validated = $request->validate([
            'nom' => 'string',
            'description' => 'string',
            'adresse' => 'string',
            'type' => 'in:mosquee,restaurant,logement,service',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'active' => 'nullable|boolean'
        ]);

        $point->update($validated);
        return response()->json($point);
    }
    
    public function destroy($id)
    {
        $point = PointInterest::findOrFail($id);
        $point->delete();
        return response()->json(['message' => 'Point d\'intérêt supprimé'], 200);
    }
}