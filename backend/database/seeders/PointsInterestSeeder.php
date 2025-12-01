<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PointsInterestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pointsInterest = [
            // Mosquées
            [
                'nom' => 'Grande Mosquée de Touba',
                'description' => 'La mosquée principale de Touba, lieu de pèlerinage et centre spirituel de la communauté mouride.',
                'type' => 'mosquee',
                'adresse' => 'Centre-ville, Touba, Sénégal',
                'latitude' => 14.8506,
                'longitude' => -15.8839,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Mosquée Massalikul Jinan',
                'description' => 'Une des plus grandes mosquées d\'Afrique de l\'Ouest, située à Dakar mais liée à la communauté mouride.',
                'type' => 'mosquee',
                'adresse' => 'Ouakam, Dakar, Sénégal',
                'latitude' => 14.7167,
                'longitude' => -17.4677,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Mosquée de Diourbel',
                'description' => 'Mosquée historique de la région de Diourbel, importante pour la communauté mouride.',
                'type' => 'mosquee',
                'adresse' => 'Centre-ville, Diourbel, Sénégal',
                'latitude' => 14.6542,
                'longitude' => -16.2289,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Restaurants
            [
                'nom' => 'Restaurant Touba',
                'description' => 'Restaurant traditionnel sénégalais servant des plats locaux authentiques dans une ambiance conviviale.',
                'type' => 'restaurant',
                'adresse' => 'Avenue Cheikh Ahmadou Bamba, Touba',
                'latitude' => 14.8520,
                'longitude' => -15.8850,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Chez Fatou',
                'description' => 'Petit restaurant familial proposant du thieboudienne, des yassa et autres spécialités sénégalaises.',
                'type' => 'restaurant',
                'adresse' => 'Quartier Darou Salam, Touba',
                'latitude' => 14.8490,
                'longitude' => -15.8820,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Restaurant Bamba',
                'description' => 'Restaurant moderne avec terrasse, spécialisé dans la cuisine sénégalaise et internationale.',
                'type' => 'restaurant',
                'adresse' => 'Route de Diourbel, Touba',
                'latitude' => 14.8470,
                'longitude' => -15.8900,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Fast Food Touba',
                'description' => 'Restauration rapide locale avec hamburgers, chawarma et plats à emporter.',
                'type' => 'restaurant',
                'adresse' => 'Marché Central, Touba',
                'latitude' => 14.8510,
                'longitude' => -15.8870,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Logements
            [
                'nom' => 'Hôtel Khadim Rassoul',
                'description' => 'Hôtel 3 étoiles moderne avec climatisation, restaurant et wifi gratuit. Idéal pour les pèlerins.',
                'type' => 'logement',
                'adresse' => 'Avenue Cheikh Ahmadou Bamba, Touba',
                'latitude' => 14.8500,
                'longitude' => -15.8845,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Auberge Touba',
                'description' => 'Auberge économique et propre, parfaite pour les voyageurs avec un budget limité.',
                'type' => 'logement',
                'adresse' => 'Quartier HLM, Touba',
                'latitude' => 14.8480,
                'longitude' => -15.8890,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Résidence Mouride',
                'description' => 'Appartements meublés pour séjours de moyenne et longue durée, avec cuisine équipée.',
                'type' => 'logement',
                'adresse' => 'Quartier Darou Minan, Touba',
                'latitude' => 14.8530,
                'longitude' => -15.8810,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Maison d\'Hôtes Serigne Touba',
                'description' => 'Maison d\'hôtes traditionnelle offrant un hébergement authentique dans un cadre familial.',
                'type' => 'logement',
                'adresse' => 'Quartier Gouye Mbind, Touba',
                'latitude' => 14.8460,
                'longitude' => -15.8880,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Services
            [
                'nom' => 'Hôpital Régional de Touba',
                'description' => 'Hôpital principal de la région offrant des soins médicaux complets et des services d\'urgence.',
                'type' => 'service',
                'adresse' => 'Route de Diourbel, Touba',
                'latitude' => 14.8440,
                'longitude' => -15.8920,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Pharmacie Centrale',
                'description' => 'Pharmacie bien approvisionnée ouverte 24h/24, avec garde pharmaceutique.',
                'type' => 'service',
                'adresse' => 'Centre-ville, Touba',
                'latitude' => 14.8515,
                'longitude' => -15.8835,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Banque Atlantique Touba',
                'description' => 'Agence bancaire avec distributeurs automatiques et services bancaires complets.',
                'type' => 'service',
                'adresse' => 'Avenue Principal, Touba',
                'latitude' => 14.8525,
                'longitude' => -15.8825,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Station Service Total',
                'description' => 'Station-service avec carburant, boutique et services de maintenance automobile.',
                'type' => 'service',
                'adresse' => 'Sortie Nord, Touba',
                'latitude' => 14.8550,
                'longitude' => -15.8800,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Poste de Touba',
                'description' => 'Bureau de poste principal avec services postaux, Western Union et Orange Money.',
                'type' => 'service',
                'adresse' => 'Place de l\'Indépendance, Touba',
                'latitude' => 14.8495,
                'longitude' => -15.8855,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Garage Auto Touba',
                'description' => 'Garage automobile complet pour réparation et entretien de tous types de véhicules.',
                'type' => 'service',
                'adresse' => 'Zone Industrielle, Touba',
                'latitude' => 14.8420,
                'longitude' => -15.8950,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Vider la table avant d'insérer de nouvelles données
        DB::table('points_interest')->truncate();

        // Insérer les données
        DB::table('points_interest')->insert($pointsInterest);

        $this->command->info('Points d\'intérêt créés avec succès !');
    }
}