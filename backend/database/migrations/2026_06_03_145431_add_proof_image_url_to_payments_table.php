<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('proof_image_url', 500)->nullable()->after('payment_url');
        });

        // Update method CHECK constraint to include 'qris'
        DB::statement("ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check");
        DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_method_check CHECK (method::text = ANY (ARRAY['cod'::character varying, 'midtrans'::character varying, 'qris'::character varying]::text[]))");

        // Update status CHECK constraint to include 'waiting_verification' and 'rejected'
        DB::statement("ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check");
        DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_status_check CHECK (status::text = ANY (ARRAY['pending'::character varying, 'waiting_verification'::character varying, 'paid'::character varying, 'failed'::character varying, 'expired'::character varying, 'rejected'::character varying]::text[]))");
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('proof_image_url');
        });

        DB::statement("ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check");
        DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_method_check CHECK (method::text = ANY (ARRAY['cod'::character varying, 'midtrans'::character varying]::text[]))");

        DB::statement("ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check");
        DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_status_check CHECK (status::text = ANY (ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'expired'::character varying]::text[]))");
    }
};
