<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;

class CheckRole {
    public function handle(Request $request, Closure $next, string $role): mixed {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        if ($user->role === 'admin' || $user->role === $role) {
            return $next($request);
        }
        return response()->json(['message' => 'Forbidden'], 403);
    }
}
