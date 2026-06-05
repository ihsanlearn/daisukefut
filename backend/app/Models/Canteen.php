<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Canteen extends Model {
    protected $fillable = ['user_id','name','description','location','is_open','image_url','qris_image_url'];
    protected $casts    = ['is_open' => 'boolean'];

    public function owner()     { return $this->belongsTo(User::class, 'user_id'); }
    public function menuItems() { return $this->hasMany(MenuItem::class); }
    public function orders()    { return $this->hasMany(Order::class); }
}