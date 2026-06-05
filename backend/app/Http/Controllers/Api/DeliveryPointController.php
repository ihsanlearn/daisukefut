<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryPointController extends Controller
{
    /**
     * List the authenticated user's delivery points.
     */
    public function index(Request $request): JsonResponse
    {
        $points = DeliveryPoint::where('user_id', $request->user()->id)->get();
        return response()->json($points);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $point = DeliveryPoint::where('user_id', $request->user()->id)->findOrFail($id);
        return response()->json($point);
    }

    /**
     * Create a new delivery point for the authenticated user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:100',
            'address' => 'required|string|max:255',
        ]);

        $point = DeliveryPoint::create([
            'user_id' => $request->user()->id,
            'name'    => $validated['name'],
            'address' => $validated['address'],
        ]);

        return response()->json($point, 201);
    }

    /**
     * Update a delivery point owned by the authenticated user.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $point = DeliveryPoint::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'name'    => 'sometimes|string|max:100',
            'address' => 'sometimes|string|max:255',
        ]);

        $point->update($validated);

        return response()->json($point);
    }

    /**
     * Delete a delivery point owned by the authenticated user.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $point = DeliveryPoint::where('user_id', $request->user()->id)->findOrFail($id);
        $point->delete();

        return response()->json(null, 204);
    }
}
