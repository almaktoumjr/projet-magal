public function up()
{
    Schema::dropIfExists('points_of_interest');
}

public function down()
{
    // Optionnel : recréer la table si besoin de rollback
}