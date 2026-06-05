<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('canteen_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('image_url', 500)->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('menu_items'); }
};
