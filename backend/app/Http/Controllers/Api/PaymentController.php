<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Cloudinary\Cloudinary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Create a payment record for an order (QRIS method).
     * Called after order is placed — sets order to waiting_for_payment.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::with(['canteen'])->findOrFail($validated['order_id']);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($order->payment && in_array($order->payment->status, ['paid', 'waiting_verification'])) {
            return response()->json(['message' => 'Payment already exists for this order'], 400);
        }

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'method' => 'qris',
                'status' => 'pending',
                'amount' => $order->total_price,
            ]
        );

        // Set order to waiting_for_payment
        $order->update(['status' => 'waiting_for_payment']);

        return response()->json($payment->load('order.canteen'), 201);
    }

    /**
     * Get payment details by order ID.
     */
    public function show(Request $request, $orderId): JsonResponse
    {
        $order = Order::with(['canteen', 'payment', 'items.menuItem'])->findOrFail($orderId);

        $user = $request->user();
        if ($user->role !== 'admin' && $order->user_id !== $user->id && $order->canteen->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'payment' => $order->payment,
            'order' => $order,
            'qris_image_url' => $order->canteen->qris_image_url,
        ]);
    }

    /**
     * Customer uploads payment proof image.
     */
    public function uploadProof(Request $request, $paymentId): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,webp|max:5120',
        ]);

        $payment = Payment::with('order')->findOrFail($paymentId);

        if ($payment->order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($payment->status === 'paid') {
            return response()->json(['message' => 'Payment already verified'], 400);
        }

        try {
            $cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                    'api_key'    => env('CLOUDINARY_API_KEY'),
                    'api_secret' => env('CLOUDINARY_API_SECRET'),
                ]
            ]);

            $result = $cloudinary->uploadApi()->upload(
                $request->file('file')->getRealPath(),
                ['folder' => 'campusfood/payment-proofs']
            );

            $payment->update([
                'proof_image_url' => $result['secure_url'],
                'status' => 'waiting_verification',
            ]);

            // Move the order status from waiting_for_payment to pending so the canteen sees it
            $payment->order->update(['status' => 'pending']);

            return response()->json($payment);

        } catch (\Exception $e) {
            Log::error('Payment Proof Upload Error: ' . $e->getMessage());
            return response()->json(['message' => 'Upload failed'], 500);
        }
    }

    /**
     * Canteen owner verifies (approves/rejects) a payment.
     */
    public function verify(Request $request, $paymentId): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'reason' => 'nullable|string|max:500',
        ]);

        $payment = Payment::with('order.canteen')->findOrFail($paymentId);

        // Only the canteen owner or admin can verify
        $user = $request->user();
        if ($user->role !== 'admin' && $payment->order->canteen->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($payment->status !== 'waiting_verification') {
            return response()->json(['message' => 'Payment is not awaiting verification'], 400);
        }

        if ($validated['action'] === 'approve') {
            $payment->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);
            $payment->order->update(['status' => 'preparing']);

            return response()->json([
                'message' => 'Payment approved, order is now preparing',
                'payment' => $payment->fresh(),
                'order' => $payment->order->fresh(),
            ]);
        } else {
            $payment->update([
                'status' => 'rejected',
            ]);
            // Allow customer to re-upload proof by reverting order status
            $payment->order->update(['status' => 'waiting_for_payment']);
            
            return response()->json([
                'message' => 'Payment rejected',
                'payment' => $payment->fresh(),
                'order' => $payment->order->fresh(),
            ]);
        }
    }
}
