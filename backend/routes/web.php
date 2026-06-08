<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'Forbidden'], 403);
});

Route::get('/gas-migrasi-daisuke', function () {
    try {
        // Memaksa Laravel menjalankan php artisan migrate lewat browser
        Artisan::call('migrate', ['--force' => true]);
        
        // Mengambil log output dari command artisan tadi
        $output = Artisan::output();
        
        return response()->json([
            'status' => 'Sukses! 🚀',
            'message' => 'Tabel berhasil dibuat di database.',
            'output' => $output
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'Gagal/Error ❌',
            'message' => $e->getMessage()
        ], 500);
    }
});