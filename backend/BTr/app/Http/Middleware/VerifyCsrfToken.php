<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    // Excluding API routes and specific paths from CSRF verification
    protected $except = [
        'api/*',
        'sanctum/csrf-cookie',
        '/api/parse-pdf',
        
    ];

    protected function tokensMatch($request)
    {
        \Log::info('Header Token: ' . $request->header('X-XSRF-TOKEN'));
        \Log::info('Session Token: ' . $request->session()->token());

        return parent::tokensMatch($request);
    }
}
