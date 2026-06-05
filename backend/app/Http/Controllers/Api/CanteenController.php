<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CanteenResource;
use App\Models\Canteen;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CanteenController extends Controller
{
    /**
     * GET /canteens — Public: list all open canteens
     */
    public function index(): JsonResponse
    {
        $canteens = Canteen::where('is_open', true)
            ->with('owner', 'menuItems')
            ->get();

        return response()->json(CanteenResource::collection($canteens));
    }

    /**
     * GET /canteens/{id} — Public: show a single canteen
     */
    public function show($id): JsonResponse
    {
        $canteen = Canteen::with('owner', 'menuItems')->findOrFail($id);

        return response()->json(new CanteenResource($canteen));
    }

    /**
     * GET /canteens/my — Owner: get the authenticated user's canteen
     */
    public function my(Request $request): JsonResponse
    {
        $canteen = Canteen::where('user_id', $request->user()->id)
            ->with('menuItems')
            ->first();

        if (!$canteen) {
            return response()->json(['message' => 'Anda belum memiliki kantin.', 'canteen' => null], 200);
        }

        return response()->json(new CanteenResource($canteen->load('owner')));
    }

    /**
     * POST /canteens — Owner: create a new canteen (max 1 per user)
     */
    public function store(Request $request): JsonResponse
    {
        // Enforce one canteen per user
        if ($request->user()->canteen()->exists()) {
            return response()->json([
                'message' => 'Anda sudah memiliki kantin. Satu akun hanya boleh memiliki satu kantin.',
            ], 409);
        }

        $validated = $request->validate([
            'name'           => 'required|string|max:100',
            'description'    => 'nullable|string',
            'location'       => 'nullable|string|max:255',
            'image_url'      => 'nullable|string|max:500',
            'qris_image_url' => 'nullable|string|max:500',
        ]);

        $canteen = Canteen::create([
            'user_id'        => $request->user()->id,
            'name'           => $validated['name'],
            'description'    => $validated['description'] ?? null,
            'location'       => $validated['location'] ?? null,
            'image_url'      => $validated['image_url'] ?? null,
            'qris_image_url' => $validated['qris_image_url'] ?? null,
            'is_open'        => true,
        ]);

        return response()->json([
            'message' => 'Kantin berhasil dibuat.',
            'canteen' => new CanteenResource($canteen->load('owner', 'menuItems')),
        ], 201);
    }

    /**
     * PUT /canteens/{id} — Owner: update canteen details
     */
    public function update(Request $request, $id): JsonResponse
    {
        $canteen = Canteen::findOrFail($id);

        if ($canteen->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name'           => 'sometimes|string|max:100',
            'description'    => 'nullable|string',
            'location'       => 'nullable|string|max:255',
            'image_url'      => 'nullable|string|max:500',
            'qris_image_url' => 'nullable|string|max:500',
            'is_open'        => 'sometimes|boolean',
        ]);

        $canteen->update($validated);

        return response()->json([
            'message' => 'Kantin berhasil diperbarui.',
            'canteen' => new CanteenResource($canteen->load('owner', 'menuItems')),
        ]);
    }

    /**
     * PATCH /canteens/{id}/toggle — Owner: toggle open/closed status
     */
    public function toggleOpen(Request $request, $id): JsonResponse
    {
        $canteen = Canteen::findOrFail($id);

        if ($canteen->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $canteen->update(['is_open' => !$canteen->is_open]);

        return response()->json([
            'message' => $canteen->is_open ? 'Kantin dibuka.' : 'Kantin ditutup.',
            'canteen' => new CanteenResource($canteen->load('owner', 'menuItems')),
        ]);
    }

    /**
     * DELETE /canteens/{id} — Owner: delete canteen
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $canteen = Canteen::findOrFail($id);

        if ($canteen->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $canteen->delete();

        return response()->json(['message' => 'Kantin berhasil dihapus.']);
    }
}
