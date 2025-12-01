<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PointInterest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PointInterestController extends Controller
{
    public function index()
    {
        // Utiliser points_interest (la bonne table)
        $points = DB::table('points_interest')->get();
        return response()->json($points);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'description' => 'required|string',
            'adresse' => 'required|string',
            'type' => 'required|in:mosquee,restaurant,logement,service',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'telephone' => 'nullable|string',
            'email' => 'nullable|email',
            'site_web' => 'nullable|url',
            'horaires' => 'nullable|string',
            'actif' => 'nullable|boolean'
        ]);

        $id = DB::table('points_interest')->insertGetId($validated);
        return response()->json(['id' => $id, 'message' => 'Point d\'intérêt créé'], 201);
    }
    
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nom' => 'string',
            'description' => 'string',
            'adresse' => 'string',
            'type' => 'in:mosquee,restaurant,logement,service',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'telephone' => 'nullable|string',
            'email' => 'nullable|email',
            'site_web' => 'nullable|url',
            'horaires' => 'nullable|string',
            'actif' => 'nullable|boolean'
        ]);

        DB::table('points_interest')->where('id', $id)->update($validated);
        return response()->json(['message' => 'Point d\'intérêt mis à jour']);
    }
    
    public function destroy($id)
    {
        DB::table('points_interest')->where('id', $id)->delete();
        return response()->json(['message' => 'Point d\'intérêt supprimé']);
    }
}