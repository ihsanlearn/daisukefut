<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Canteen;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // For general browsing, could add filtering here.
        // Assuming byCanteen handles the main functionality.
        return response()->json(MenuItem::all());
    }

    public function byCanteen(Request $request, $canteenId): JsonResponse
    {
        $query = MenuItem::where('canteen_id', $canteenId);

        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', $request->input('category'));
            });
        }

        if (!$request->boolean('include_unavailable')) {
            $query->where('is_available', true);
        }

        $items = $query->with('category')->get();
        return response()->json($items);
    }

    public function store(Request $request, $canteenId): JsonResponse
    {
        $canteen = Canteen::findOrFail($canteenId);

        if ($canteen->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image_url' => 'nullable|string|url|max:500',
        ]);

        $menuItem = MenuItem::create([
            'canteen_id' => $canteen->id,
            'category_id' => $validated['category_id'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'image_url' => $validated['image_url'] ?? null,
            'is_available' => true,
        ]);

        return response()->json($menuItem->load('category'), 201);
    }

    public function update(Request $request, $canteenId, $id): JsonResponse
    {
        $canteen = Canteen::findOrFail($canteenId);

        if ($canteen->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $menuItem = MenuItem::where('canteen_id', $canteen->id)->findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|nullable|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'image_url' => 'nullable|string|url|max:500',
            'is_available' => 'sometimes|boolean',
        ]);

        $menuItem->update($validated);

        return response()->json($menuItem->load('category'));
    }

    public function destroy(Request $request, $canteenId, $id): JsonResponse
    {
        $canteen = Canteen::findOrFail($canteenId);

        if ($canteen->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $menuItem = MenuItem::where('canteen_id', $canteen->id)->findOrFail($id);
        $menuItem->delete();

        return response()->json(null, 204);
    }
}
