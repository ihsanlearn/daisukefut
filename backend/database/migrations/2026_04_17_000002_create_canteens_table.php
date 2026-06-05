<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('canteens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('location', 255)->nullable();
            $table->boolean('is_open')->default(true);
            $table->string('image_url', 500)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('canteens'); }
};
