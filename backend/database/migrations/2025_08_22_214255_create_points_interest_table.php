<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('points_interest', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->text('description');
            $table->enum('type', ['mosquee', 'restaurant', 'logement', 'service']);
            $table->string('adresse');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();
            $table->string('site_web')->nullable();
            $table->json('horaires')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();

            // Index pour les recherches par type
            $table->index('type');
            // Index pour les recherches géographiques
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('points_interest');
    }
};