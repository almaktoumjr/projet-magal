<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointInterest extends Model
{
    use HasFactory;

    protected $table = 'points_of_interest';

    protected $fillable = [
        'nom',
        'description',
        'type',
        'adresse',
        'latitude',
        'longitude',
        'active',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'active' => 'boolean',
    ];

    // Scopes pour filtrer par type
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    // Méthode pour calculer la distance entre deux points
    public function distanceTo($latitude, $longitude)
    {
        if (!$this->latitude || !$this->longitude) {
            return null;
        }

        $earthRadius = 6371; // Rayon de la Terre en kilomètres

        $dLat = deg2rad($latitude - $this->latitude);
        $dLng = deg2rad($longitude - $this->longitude);

        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($this->latitude)) * cos(deg2rad($latitude)) *
             sin($dLng/2) * sin($dLng/2);

        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $distance = $earthRadius * $c;

        return round($distance, 2);
    }

    // Scope pour rechercher dans un rayon donné
    public function scopeWithinRadius($query, $latitude, $longitude, $radiusKm = 10)
    {
        $haversine = "(6371 * acos(cos(radians($latitude))
                     * cos(radians(latitude))
                     * cos(radians(longitude)
                     - radians($longitude))
                     + sin(radians($latitude))
                     * sin(radians(latitude))))";

        return $query->selectRaw("*, $haversine AS distance")
                    ->havingRaw("distance < $radiusKm")
                    ->orderBy('distance');
    }

    // Accesseur pour obtenir le label du type en français
    public function getTypeLabelAttribute()
    {
        $labels = [
            'mosquee' => 'Mosquée',
            'restaurant' => 'Restaurant',
            'logement' => 'Logement',
            'service' => 'Service',
        ];

        return $labels[$this->type] ?? $this->type;
    }

    // Accesseur pour obtenir la couleur associée au type
    public function getTypeColorAttribute()
    {
        $colors = [
            'mosquee' => '#4CAF50',
            'restaurant' => '#FF9800',
            'logement' => '#2196F3',
            'service' => '#9C27B0',
        ];

        return $colors[$this->type] ?? '#757575';
    }
}