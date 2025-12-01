<?php
// PilgrimController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Pilgrim;
use Illuminate\Http\Request;

class PilgrimController extends Controller
{
    public function index()
    {
        return Pilgrim::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:pilgrims',
            'password' => 'required|string|min:6',
            'telephone' => 'required|string|max:20',
            'ville' => 'required|string|max:255'
        ]);

        $validated['date_inscription'] = now()->toDateString();
        // Stocker le mot de passe en clair (pas de hashage)
        // $validated['password'] reste tel quel

        return Pilgrim::create($validated);
    }

    public function show(Pilgrim $pilgrim)
    {
        return $pilgrim;
    }
}
