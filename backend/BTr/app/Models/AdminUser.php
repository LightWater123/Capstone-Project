<?php

namespace App\Models;

use MongoDB\Laravel\Auth\User as Authenticatable; // mongodb support for Eloquent
use Laravel\Sanctum\HasApiTokens; //enables API token support for user authentication via Sanctum


class AdminUser extends Authenticatable
{
    // contains admin's username, email, and password

    use HasApiTokens; // handles login credentials

    // declare collection and connection
    protected $connection = 'mongodb';
    protected $collection = 'admin_users';

    // columns for admins credentials and fillable field for mass assignment
    protected $fillable = 
    [
        'username', 'email', 'password','mobile_number',
    ];
    
    // hidden attribute
    protected $hidden = 
    [
        'password'
    ];
}
