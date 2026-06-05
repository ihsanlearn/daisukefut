<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('method', ['cod', 'midtrans']);
            $table->enum('status', ['pending', 'paid', 'failed', 'expired'])->default('pending');
            $table->decimal('amount', 12, 2);
            $table->string('snap_token', 255)->nullable();
            $table->string('payment_url', 500)->nullable();
            $table->string('midtrans_order_id', 100)->nullable()->unique();
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('payments'); }
};
