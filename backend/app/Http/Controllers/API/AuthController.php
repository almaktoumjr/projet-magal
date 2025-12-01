<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Pilgrim;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $pilgrim = Pilgrim::where('email', $credentials['email'])->first();

        // Comparaison en clair (pas de hashage)
        if (!$pilgrim || $pilgrim->password !== $credentials['password']) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect.',
            ], 401);
        }

        // Pour l’instant on renvoie un token simple stocké seulement côté frontend
        $token = Str::random(60);

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $pilgrim->id,
                'nom' => $pilgrim->nom,
                'prenom' => $pilgrim->prenom,
                'email' => $pilgrim->email,
                'telephone' => $pilgrim->telephone,
                'ville' => $pilgrim->ville,
                'isAdmin' => false,
                'role' => 'user',
            ],
        ]);
    }

    public function logout(Request $request)
    {
        // Pas de vraie gestion de token pour l’instant : on renvoie juste un OK
        return response()->json(['message' => 'Déconnecté'], 200);
    }
}


