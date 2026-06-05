<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CanteenResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'user_id'        => $this->user_id,
            'name'           => $this->name,
            'description'    => $this->description,
            'image_url'      => $this->image_url,
            'qris_image_url' => $this->qris_image_url,
            'is_open'        => (bool) $this->is_open,
            'location'       => $this->location,

            'owner'       => new UserResource($this->whenLoaded('owner')),
            'menu_items'  => $this->whenLoaded('menuItems'),

            // Metadata
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
        ];
    }
}
