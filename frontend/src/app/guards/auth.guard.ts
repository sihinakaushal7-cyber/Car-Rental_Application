import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // Check if user is logged in
    const isLoggedIn = !!localStorage.getItem("token");

    if (!isLoggedIn) {
      this.router.navigate(["/login"]);
      return false;
    }

    return true;
  }
}
