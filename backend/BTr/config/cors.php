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

    'allowed_headers' => ['*'],

    'supports_credentials' => true,
];
