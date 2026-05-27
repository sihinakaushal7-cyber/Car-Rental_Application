import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  standalone: false
})
export class BookingComponent implements OnInit {
  vehicleId!: number;
  vehicle: Vehicle | null = null;
  startDate: string = '';
  endDate: string = '';
  totalPrice: number = 0;
  today: string = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.vehicleId = +params['id'];
      if (this.vehicleId) {
        this.loadVehicle();
      }
    });

    // Default dates
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    this.startDate = tmr.toISOString().split('T')[0];

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);
    this.endDate = dayAfter.toISOString().split('T')[0];
  }

  loadVehicle(): void {
    this.vehicleService.getVehicleById(this.vehicleId).subscribe({
      next: (v) => {
        this.vehicle = v;
        this.calculateTotal();
      },
      error: (err) => console.error('Error fetching vehicle:', err)
    });
  }

  calculateTotal(): void {
    try {
      if (this.startDate && this.endDate && this.vehicle) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn('⚠️ Invalid dates selected');
          this.totalPrice = 0;
          return;
        }

        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          this.totalPrice = diffDays * (this.vehicle.dailyRate || 0);
          console.log(`💰 Calculated Total: $${this.totalPrice} for ${diffDays} days`);
        } else {
          this.totalPrice = 0;
        }
      }
    } catch (e) {
      console.error('❌ Error calculating total:', e);
      this.totalPrice = 0;
    }
  }

  onConfirmBooking(): void {
    if (!this.vehicle) {
      alert('Vehicle data is not loaded yet.');
      return;
    }

    if (this.totalPrice <= 0) {
      alert('Please select valid rental dates (Return date must be after Pick-up date).');
      return;
    }

    const bookingData = {
      vehicleId: this.vehicle.id,
      startDate: this.startDate,
      endDate: this.endDate,
      totalCost: this.totalPrice,
      car: this.vehicle,
      pickupLocation: 'Main Office'
    };

    console.log('📤 Submitting booking...', bookingData);

    this.bookingService.createBooking(bookingData).subscribe({
      next: (confirmedBooking) => {
        if (!confirmedBooking || !confirmedBooking.id) {
          console.error('❌ Server returned invalid booking data:', confirmedBooking);
          alert('Booking failed: Invalid response from server.');
          return;
        }

        console.log('✅ Booking Confirmed:', confirmedBooking);

        const navigationExtras = {
          state: {
            bookingData: {
              bookingId: confirmedBooking.id,
              vehicleName: `${this.vehicle?.brand} ${this.vehicle?.model}`,
              vehicleImage: this.vehicle?.imageUrl,
              startDate: this.startDate,
              endDate: this.endDate,
              totalCost: this.totalPrice,
              dailyRate: this.vehicle?.dailyRate,
              days: Math.ceil((new Date(this.endDate).getTime() - new Date(this.startDate).getTime()) / (1000 * 60 * 60 * 24)),
              pickupLocation: 'Main Office',
              status: 'confirmed',
              vehicleDetails: {
                brand: this.vehicle?.brand,
                model: this.vehicle?.model,
                year: this.vehicle?.year,
                transmission: this.vehicle?.transmission,
                seats: this.vehicle?.seats,
                fuelType: this.vehicle?.fuelType
              }
            }
          }
        };

        this.router.navigate(['/booking-confirmation'], navigationExtras);
      },
      error: (err) => {
        console.error('❌ Booking failure details:', err);
        alert(`Booking failed: ${err.message || 'Unknown error'}. Please try again.`);
      }
    });
  }
}
