import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCarComponent } from './add-car.component';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('AddCarComponent', () => {
  let component: AddCarComponent;
  let fixture: ComponentFixture<AddCarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 1. If AddCarComponent is standalone, it stays here.
      // 2. If you get an error saying 'AddCarComponent is not standalone', 
      //    move it to a 'declarations: [AddCarComponent]' array instead.
      imports: [AddCarComponent, FormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(AddCarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Look closely at the dots and parentheses here:
    expect(component).toBeTruthy();
  });
});