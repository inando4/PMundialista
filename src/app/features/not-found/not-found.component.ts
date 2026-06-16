import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="panel empty-state">
      <h1>Pagina no encontrada</h1>
      <a class="primary-button" routerLink="/ranking">Volver al ranking</a>
    </section>
  `,
})
export class NotFoundComponent {}
