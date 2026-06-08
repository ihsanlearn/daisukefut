<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/v1/*', 'api/*', 'sanctum/csrf-cookie', 'register', 'login', 'logout'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_map('trim', explode(',', env('ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:3001')))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];