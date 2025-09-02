<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model; // mongodb support for Eloquent

class MaintenanceSchedule extends Model
{
    protected $connection = 'mongodb';
    protected $fillable = [
        'equipment_id',
        'scheduled_date',
        'contact_name',
        'contact_number',
        'contact_email',
        'notes',
        'status',
    ];
}
