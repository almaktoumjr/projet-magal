<?php
// Event.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre', 'description', 'lieu', 'heure', 'date', 'type', 'active'
    ];

    protected $casts = [
        'date' => 'date',
        'active' => 'boolean'
    ];
}

