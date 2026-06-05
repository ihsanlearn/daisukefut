<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\Canteen;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users(): JsonResponse
    {
        return response()->json(User::with('canteen')->get());
    }

    public function activate(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        return response()->json($user);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'total_canteens' => Canteen::count(),
            'total_orders' => Order::count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
        ];

        return response()->json($stats);
    }
}
