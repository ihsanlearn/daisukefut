<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'Forbidden'], 403);
});

Route::get('/ready', function () {
    return response()->json(['status' => 'Ready! 🎉']);
});

Route::get('/gas-bulk-database', function () {
    try {
        Artisan::call('db:seed', ['--force' => true]);
        return response()->json(['status' => 'Sukses bulk data! 🌾']);
    } catch (\Exception $e) {
        return response()->json(['status' => 'Gagal', 'error' => $e->getMessage()]);
    }
});