<?php
// Pilgrim.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pilgrim extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom', 'prenom', 'email', 'telephone', 'ville', 'date_inscription'
    ];

    protected $casts = [
        'date_inscription' => 'date'
    ];
}
