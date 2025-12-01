<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Événements
        DB::table('events')->insert([
            [
                'titre' => 'Prière du Maghrib',
                'description' => 'Prière collective du coucher du soleil',
                'lieu' => 'Grande Mosquée de Touba',
                'heure' => '18:30',
                'date' => Carbon::now()->addDay(),
                'type' => 'priere',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'titre' => 'Conférence sur l\'histoire du Magal',
                'description' => 'Présentation de l\'histoire et des traditions du Magal',
                'lieu' => 'Centre culturel',
                'heure' => '20:00',
                'date' => Carbon::now()->addDay(),
                'type' => 'conference',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // Points d'intérêt - utilisant le nom exact de la table créée
        DB::table('points_of_interest')->insert([
            [
                'nom' => 'Grande Mosquée de Touba',
                'description' => 'La mosquée principale de Touba',
                'adresse' => 'Centre ville, Touba',
                'latitude' => 14.8500,
                'longitude' => -15.8833,
                'type' => 'mosquee',
                'active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom' => 'Restaurant Al Baraka',
                'description' => 'Restaurant traditionnel sénégalais',
                'adresse' => 'Avenue Cheikh Ahmadou Bamba, Touba',
                'latitude' => 14.8520,
                'longitude' => -15.8820,
                'type' => 'restaurant',
                'active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom' => 'Mosquée Serigne Fallou',
                'description' => 'Mosquée historique de Touba',
                'adresse' => 'Quartier Darou Salam, Touba',
                'latitude' => 14.8480,
                'longitude' => -15.8840,
                'type' => 'mosquee',
                'active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom' => 'Hôtel Khadim Rassoul',
                'description' => 'Hébergement pour pèlerins',
                'adresse' => 'Route de Mbacké, Touba',
                'latitude' => 14.8510,
                'longitude' => -15.8810,
                'type' => 'logement',
                'active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom' => 'Centre de Santé de Touba',
                'description' => 'Services médicaux pour les pèlerins',
                'adresse' => 'Avenue Cheikh Ahmadou Bamba, Touba',
                'latitude' => 14.8490,
                'longitude' => -15.8850,
                'type' => 'service',
                'active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // Pèlerins de test
        $pilgrims = [];
        for ($i = 1; $i <= 100; $i++) {
            $pilgrims[] = [
                'nom' => 'Nom' . $i,
                'prenom' => 'Prenom' . $i,
                'email' => 'pilgrim' . $i . '@test.com',
                'telephone' => '77123456' . sprintf('%02d', $i),
                'ville' => 'Dakar',
                'date_inscription' => Carbon::now()->subDays(rand(1, 30)),
                'created_at' => now(),
                'updated_at' => now()
            ];
        }
        
        // Insertion par batch pour de meilleures performances
        DB::table('pilgrims')->insert($pilgrims);
        
        $this->command->info('Base de données peuplée avec succès !');
    }
}