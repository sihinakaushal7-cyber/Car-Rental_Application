import { Component, OnInit } from '@angular/core';
import { BookingService, Booking } from '../../services/booking.service';
// import { MyBookingsComponent } from './components/my-bookings/my-booking.component';

@Component({
  selector: 'app-mybookings',
  templateUrl: './mybookings.component.html',
  styleUrls: ['./mybookings.component.css']
})
export class MyBookingsComponent implements OnInit {


  // Array to hold bookings from MySQL
  bookings: Booking[] = [];
  isLoading: boolean = true;

  constructor(private bookingService: BookingService) { }

  ngOnInit(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userId = user.id;
        if (userId) {
          console.log('📋 Loading history for user ID:', userId);
          this.loadUserHistory(userId);
          return;
        }
      } catch (e) {
        console.error('Error parsing user for history:', e);
      }
    }

    // Fallback if no user ID found
    console.warn('⚠️ No user ID found for history, using fallback 1');
    this.loadUserHistory(1);
  }

  loadUserHistory(userId: number): void {
    this.isLoading = true;
    this.bookingService.getUserBookings(userId).subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.isLoading = false;
      }
    });
  }

  // Logic to handle the "Cancel" button in the UI
  cancelBooking(id: number | undefined): void {
    if (id && confirm('Are you sure you want to cancel this trip?')) {
      this.bookingService.cancelBooking(id).subscribe(() => {
        // UI trick: Remove it from the list instantly
        this.bookings = this.bookings.filter(b => b.id !== id);
      });
    }
  }

  // Method to download a text invoice/slip
  downloadInvoice(booking: Booking): void {
    const invoiceContent = `
========================================
       CAR RENTAL SERVICE - INVOICE
========================================
Booking ID: # ${booking.id}
Status: ${booking.status?.toUpperCase()}
Date Issued: ${new Date().toLocaleDateString()}

VEHICLE DETAILS:
----------------------------------------
Vehicle: ${booking.car?.brand} ${booking.car?.model}
Category: ${booking.car?.category}
Year: ${booking.car?.year}

RENTAL PERIOD:
----------------------------------------
Pick-up: ${new Date(booking.startDate).toLocaleDateString()}
Return: ${new Date(booking.endDate).toLocaleDateString()}

PAYMENT SUMMARY:
----------------------------------------
Total Amount: $${booking.totalCost}
Status: Paid (Mock)

Thank you for choosing our service!
========================================
    `;

    const blob = new Blob([invoiceContent.trim()], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_Booking_${booking.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Helper to clear own history if it was leaked from User 2
  clearMyHistory(): void {
    if (confirm('This will wipe out your local rental history. This is helpful if you are seeing bookings from other users. Proceed?')) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.id) {
            // Clear in localStorage
            let allBookings = JSON.parse(localStorage.getItem("allBookings") || "[]");
            allBookings = allBookings.filter((b: any) => Number(b.userId) !== Number(user.id));
            localStorage.setItem("allBookings", JSON.stringify(allBookings));

            // Refresh UI
            this.bookings = [];
            alert('History cleared successfully. New bookings will now be unique to you!');
          }
        } catch (e) {
          console.error('Error clearing history:', e);
        }
      }
    }
  }
}