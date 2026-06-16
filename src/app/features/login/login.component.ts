import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/supabase.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly supabase = inject(SupabaseService);

  readonly mode = signal<'login' | 'signup'>('login');
  readonly loading = signal(false);
  readonly message = signal('');

  readonly form = this.fb.nonNullable.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit(): Promise<void> {
    this.message.set('');
    this.loading.set(true);

    try {
      const { displayName, email, password } = this.form.getRawValue();

      if (this.mode() === 'signup') {
        if (!displayName.trim()) {
          throw new Error('Ingresa tu nombre para registrarte.');
        }
        const hasSession = await this.supabase.signUp(email.trim(), password, displayName.trim());
        if (hasSession) {
          await this.router.navigateByUrl('/ranking');
          return;
        }
        this.mode.set('login');
      } else {
        await this.supabase.signIn(email.trim(), password);
        await this.router.navigateByUrl('/ranking');
      }
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'No se pudo completar la operacion.');
    } finally {
      this.loading.set(false);
    }
  }

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'signup' : 'login');
    this.message.set('');
  }
}
