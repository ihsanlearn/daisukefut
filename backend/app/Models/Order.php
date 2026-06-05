<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Order extends Model {
    protected $fillable = [
        'user_id','canteen_id','delivery_point_id',
        'status','total_price','notes','ordered_at','delivered_at'
    ];
    protected $casts = ['total_price' => 'decimal:2'];

    public function user()          { return $this->belongsTo(User::class); }
    public function canteen()       { return $this->belongsTo(Canteen::class); }
    public function deliveryPoint() { return $this->belongsTo(DeliveryPoint::class); }
    public function items()         { return $this->hasMany(OrderItem::class); }
    public function payment()       { return $this->hasOne(Payment::class); }
    public function notifications() { return $this->hasMany(Notification::class); }
}
