<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'canteen') {
            $query = Order::whereHas('canteen', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });

            if ($request->has('status')) {
                $query->where('status', $request->input('status'));
            }

            return response()->json($query->with(['items.menuItem', 'user', 'deliveryPoint', 'payment'])->get());
        }

        if ($user->role === 'admin') {
            return response()->json(Order::with(['items.menuItem', 'user', 'deliveryPoint', 'canteen', 'payment'])->get());
        }

        // Customer orders
        return response()->json($user->orders()->with(['items.menuItem', 'canteen', 'deliveryPoint', 'payment'])->get());
    }

    public function show(Request $request, $id): JsonResponse
    {
        $order = Order::with(['items.menuItem', 'canteen', 'deliveryPoint', 'payment', 'user'])->findOrFail($id);

        $user = $request->user();
        if ($user->role !== 'admin' && $order->user_id !== $user->id && $order->canteen->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($order);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'canteen_id' => 'required|exists:canteens,id',
            'delivery_point_id' => 'required|exists:delivery_points,id',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $totalPrice = 0;
            $orderItems = [];

            foreach ($validated['items'] as $item) {
                $menuItem = MenuItem::findOrFail($item['menu_item_id']);
                
                if ($menuItem->canteen_id != $validated['canteen_id']) {
                    throw new \Exception("Menu item {$menuItem->name} does not belong to the selected canteen.");
                }

                $subtotal = $menuItem->price * $item['quantity'];
                $totalPrice += $subtotal;

                $orderItems[] = new OrderItem([
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            $order = Order::create([
                'user_id' => $request->user()->id,
                'canteen_id' => $validated['canteen_id'],
                'delivery_point_id' => $validated['delivery_point_id'],
                'status' => 'pending', // OrderStatus: pending, confirmed, cooking, ready, delivering, completed, cancelled
                'total_price' => $totalPrice,
                'notes' => $validated['notes'] ?? null,
                'ordered_at' => now(),
            ]);

            $order->items()->saveMany($orderItems);

            return response()->json($order->load(['items.menuItem', 'canteen', 'deliveryPoint']), 201);
        });
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:waiting_for_payment,pending,confirmed,preparing,delivering,delivered,cancelled',
        ]);

        $order = Order::with('canteen')->findOrFail($id);

        if ($request->user()->role !== 'admin' && $order->canteen->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $order->update(['status' => $validated['status']]);

        if ($validated['status'] === 'delivered') {
            $order->update(['delivered_at' => now()]);
        }

        return response()->json($order->load(['items.menuItem', 'canteen', 'deliveryPoint']));
    }

    public function cancel(Request $request, $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        if ($order->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json(['message' => 'Order cannot be cancelled at this stage'], 400);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json($order);
    }
}
