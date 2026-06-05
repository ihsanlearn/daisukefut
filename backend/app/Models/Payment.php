<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model {
    protected $fillable = [
        'order_id', 'method', 'status', 'amount',
        'proof_image_url', 'snap_token', 'payment_url',
        'midtrans_order_id', 'expired_at', 'paid_at'
    ];
    protected $casts = ['amount' => 'decimal:2'];

    public function order() { return $this->belongsTo(Order::class); }
}
