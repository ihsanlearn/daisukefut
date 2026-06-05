<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CanteenController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DeliveryPointController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\UploadController;

// API Status
Route::get('/status', function () {
    return response()->json(['status' => 'ok']);
});

// statefulApi() in bootstrap/app.php already applies
// EnsureFrontendRequestsAreStateful (which includes the web middleware stack).
// Do NOT add 'web' or EnsureFrontendRequestsAreStateful again here
// — doing so causes duplicate session/CSRF handling and token mismatch errors.

Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login',    [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me',      [AuthController::class, 'me']);

            // Delivery points
            Route::apiResource('delivery-points', DeliveryPointController::class);

            // Orders
            Route::get('/orders', [OrderController::class, 'index']);
            Route::post('/orders', [OrderController::class, 'store']);
            Route::get('/orders/{id}', [OrderController::class, 'show']);
            Route::patch('/orders/{id}/cancel', [OrderController::class, 'cancel']);

            // Payments
            Route::post('/payments',                    [PaymentController::class, 'store']);
            Route::get('/payments/{orderId}',            [PaymentController::class, 'show']);
            Route::post('/payments/{id}/proof',          [PaymentController::class, 'uploadProof']);
            Route::patch('/payments/{id}/verify',        [PaymentController::class, 'verify']);

            // Notifications
            Route::get('/notifications',          [NotificationController::class, 'index']);
            Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);

            // Upload
            Route::post('/upload/image',          [UploadController::class, 'image']);

            // Canteen owner routes
            Route::middleware('role:canteen')->group(function () {
                Route::get('/canteens/my',            [CanteenController::class, 'my']);
                Route::post('/canteens',              [CanteenController::class, 'store']);
                Route::put('/canteens/{id}',          [CanteenController::class, 'update']);
                Route::delete('/canteens/{id}',       [CanteenController::class, 'destroy']);
                Route::patch('/canteens/{id}/toggle',  [CanteenController::class, 'toggleOpen']);
                
                Route::post('/canteens/{id}/menu', [MenuController::class, 'store']);
                Route::put('/canteens/{canteen_id}/menu/{id}', [MenuController::class, 'update']);
                Route::delete('/canteens/{canteen_id}/menu/{id}', [MenuController::class, 'destroy']);

                Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
            });

            // Admin routes
            Route::middleware('role:admin')->prefix('admin')->group(function () {
                Route::get('/users',                 [AdminController::class, 'users']);
                Route::patch('/users/{id}/activate', [AdminController::class, 'activate']);
                Route::get('/stats',                 [AdminController::class, 'stats']);
            });
    });
});


// Public: canteen & menu browsing
Route::get('/canteens',              [CanteenController::class, 'index']);
Route::get('/canteens/{id}',         [CanteenController::class, 'show']);
Route::get('/canteens/{id}/menu',    [MenuController::class, 'byCanteen']);
Route::get('/categories',            [CategoryController::class, 'index']);



