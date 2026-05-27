import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  formData = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    driverLicenseNumber: ''
  };
  
  errorMessage = '';
  isLoading = false;
  passwordsMatch = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  checkPasswords(): void {
    this.passwordsMatch = this.formData.password === this.formData.confirmPassword;
  }

  onSubmit(): void {
    


    this.errorMessage = '';
    
    
    if (!this.passwordsMatch) {
      this.errorMessage = 'Passwords do not match';
     console.log("Data is", this.formData);
      return;
    }
    
    this.isLoading = true;

    const userData = {
      email: this.formData.email,
      password: this.formData.password,
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      phoneNumber: this.formData.phoneNumber,
      address: this.formData.address,
      driverLicenseNumber: this.formData.driverLicenseNumber
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
       if (error.error && typeof error.error === 'object' && error.error.message) {
      this.errorMessage = error.error.message;
    }

    else if (typeof error.error === 'string') {
      this.errorMessage = error.error;
    }

    else {
      this.errorMessage = 'Registration failed. Please try again.';
    }

    console.error('Registration error details:', error);
      }
    });

    

    
  }
}
