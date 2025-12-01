<?php
// EventController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        return Event::where('active', true)
                   ->orderBy('date', 'asc')
                   ->orderBy('heure', 'asc')
                   ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'required|string',
            'lieu' => 'required|string|max:255',
            'heure' => 'required|date_format:H:i',
            'date' => 'required|date',
            'type' => 'required|in:priere,conference,evenement'
        ]);

        return Event::create($validated);
    }

    public function show(Event $event)
    {
        return $event;
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'titre' => 'string|max:255',
            'description' => 'string',
            'lieu' => 'string|max:255',
            'heure' => 'date_format:H:i',
            'date' => 'date',
            'type' => 'in:priere,conference,evenement',
            'active' => 'boolean'
        ]);

        $event->update($validated);
        return $event;
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(null, 204);
    }
}