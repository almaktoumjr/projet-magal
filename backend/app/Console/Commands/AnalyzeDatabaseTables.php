<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AnalyzeDatabaseTables extends Command
{
    protected $signature = 'db:analyze-tables';
    protected $description = 'Analyse les tables de la base de données pour détecter les redondances';

    public function handle()
    {
        $this->info("=== ANALYSE DES TABLES DE LA BASE DE DONNÉES ===\n");

        // Récupérer toutes les tables
        $tables = $this->getAllTables();
        
        $this->info("Nombre total de tables : " . count($tables) . "\n");

        // Analyser chaque table
        $tableStructures = [];
        foreach ($tables as $table) {
            $tableStructures[$table] = $this->analyzeTable($table);
        }

        // Comparer les tables pour trouver des similitudes
        $this->info("\n=== RECHERCHE DE TABLES SIMILAIRES ===\n");
        $this->findSimilarTables($tableStructures);

        // Afficher les relations
        $this->info("\n=== ANALYSE DES RELATIONS ===\n");
        $this->analyzeRelations($tableStructures);
    }

    private function getAllTables()
    {
        $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        return array_column($tables, 'name');
    }

    private function analyzeTable($tableName)
    {
        $this->line("\n--- Table: $tableName ---");
        
        // Obtenir les colonnes via PRAGMA (compatible SQLite)
        $columns = DB::select("PRAGMA table_info($tableName)");
        $columnNames = array_column($columns, 'name');
        
        $this->info("Colonnes (" . count($columns) . ") : " . implode(', ', $columnNames));
        
        // Compter les enregistrements
        $count = DB::table($tableName)->count();
        $this->info("Nombre d'enregistrements : $count");
        
        // Obtenir les indexes
        $indexes = DB::select("PRAGMA index_list($tableName)");
        if (!empty($indexes)) {
            $indexNames = array_column($indexes, 'name');
            $this->info("Index : " . implode(', ', $indexNames));
        }
        
        return [
            'columns' => $columnNames,
            'column_details' => $columns,
            'count' => $count,
            'indexes' => $indexes
        ];
    }

    private function findSimilarTables($tableStructures)
    {
        $tables = array_keys($tableStructures);
        $similarities = [];

        for ($i = 0; $i < count($tables); $i++) {
            for ($j = $i + 1; $j < count($tables); $j++) {
                $table1 = $tables[$i];
                $table2 = $tables[$j];
                
                $columns1 = $tableStructures[$table1]['columns'];
                $columns2 = $tableStructures[$table2]['columns'];
                
                // Calculer la similarité
                $commonColumns = array_intersect($columns1, $columns2);
                $totalColumns = array_unique(array_merge($columns1, $columns2));
                $similarity = (count($commonColumns) / count($totalColumns)) * 100;
                
                if ($similarity > 50) { // Plus de 50% de colonnes communes
                    $similarities[] = [
                        'table1' => $table1,
                        'table2' => $table2,
                        'similarity' => $similarity,
                        'common_columns' => $commonColumns
                    ];
                }
            }
        }

        if (empty($similarities)) {
            $this->info("Aucune table similaire détectée (>50% de colonnes communes)");
        } else {
            foreach ($similarities as $sim) {
                $this->warn(sprintf(
                    "⚠️  %s et %s sont similaires à %.1f%%",
                    $sim['table1'],
                    $sim['table2'],
                    $sim['similarity']
                ));
                $this->line("   Colonnes communes : " . implode(', ', $sim['common_columns']));
            }
        }
    }

    private function analyzeRelations($tableStructures)
    {
        foreach ($tableStructures as $tableName => $structure) {
            $foreignKeys = [];
            
            foreach ($structure['columns'] as $column) {
                // Détecter les clés étrangères potentielles
                if (preg_match('/_id$/', $column) && $column !== 'id') {
                    $referencedTable = str_replace('_id', '', $column);
                    // Vérifier si la table existe
                    if (isset($tableStructures[$referencedTable]) || isset($tableStructures[$referencedTable . 's'])) {
                        $foreignKeys[] = "$column → $referencedTable";
                    }
                }
            }
            
            if (!empty($foreignKeys)) {
                $this->line("$tableName :");
                foreach ($foreignKeys as $fk) {
                    $this->line("  - $fk");
                }
            }
        }
    }
}