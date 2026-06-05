<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password_hash',
        'role',
        'phone',
        'is_active',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Override kolom password Laravel (default: 'password') -> 'password_hash'
     */
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    // Relationships
    public function canteen()
    {
        return $this->hasOne(Canteen::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function deliveryPoints()
    {
        return $this->hasMany(DeliveryPoint::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}