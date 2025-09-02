<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MaintenanceScheduled extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */

    public $data;

    public function __construct()
    {
        $this->data = $data;
    }

    public function build() 
    {
        return $this->subject('New Maintenance Scheduled')
                    ->view('emails.maintenance-scheduled') // call blade file
                    ->with('data', $this->data); 
    }
}
