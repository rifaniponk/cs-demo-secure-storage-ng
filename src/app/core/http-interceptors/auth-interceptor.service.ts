import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { SessionVaultService } from '../session-vault/session-vault.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private vault: SessionVaultService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(
      this.requestRequiresToken(req)
        ? this.vault.getSession().then((session) => {
            if (session) {
              req = req.clone({
                setHeaders: {
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  Authorization: 'Bearer ' + session.token,
                },
              });
            }
          })
        : Promise.resolve()
    ).pipe(mergeMap(() => next.handle(req)));
  }

  private requestRequiresToken(req: HttpRequest<any>): boolean {
    return !/\/login$/.test(req.url);
  }
}
