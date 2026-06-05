<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model {
    protected $fillable = ['canteen_id','category_id','name','description','price','image_url','is_available'];
    protected $casts    = ['is_available' => 'boolean', 'price' => 'decimal:2'];

    public function canteen()    { return $this->belongsTo(Canteen::class); }
    public function category()   { return $this->belongsTo(Category::class); }
    public function orderItems() { return $this->hasMany(OrderItem::class); }
}
