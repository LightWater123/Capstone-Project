<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'admin/*',
        'service/*'
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:5173'],

    'allowed_headers' => [

        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'Accept',
        'Origin',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
        'x-xsrf-token',
    ],

    'allowed_origins_patterns' => [],

    'supports_credentials' => true,
];
