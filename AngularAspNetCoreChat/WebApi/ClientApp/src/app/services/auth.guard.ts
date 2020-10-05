import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthenticationService as AuthGuard } from "./auth.service";

@Injectable()
export class AuthenticationGuardService implements CanActivate{

  constructor(public auth: AuthGuard, public router: Router) { }

  canActivate() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['login']);
      return false;
    }
    else return true;
  }
}
