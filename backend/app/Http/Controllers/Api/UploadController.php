<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Cloudinary\Cloudinary;
use Illuminate\Support\Facades\Log;

class UploadController extends Controller
{
    public function image(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,webp|max:5120', // 5MB max
            'folder' => 'nullable|string'
        ]);

        try {
            $cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                    'api_key'    => env('CLOUDINARY_API_KEY'),
                    'api_secret' => env('CLOUDINARY_API_SECRET'),
                ]
            ]);

            $folder = $request->input('folder', 'campusfood');
            
            $result = $cloudinary->uploadApi()->upload(
                $request->file('file')->getRealPath(),
                ['folder' => $folder]
            );

            return response()->json(['url' => $result['secure_url']]);

        } catch (\Exception $e) {
            Log::error('Cloudinary Upload Error: ' . $e->getMessage());
            return response()->json(['message' => 'Upload failed'], 500);
        }
    }
}
