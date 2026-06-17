import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/supabase.service';

@Component({
  selector: 'app-update-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './update-password.component.html',
})
export class UpdatePasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly supabase = inject(SupabaseService);

  readonly loading = signal(false);
  readonly message = signal('');
  readonly canUpdate = signal(false);

  readonly form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  async ngOnInit(): Promise<void> {
    const session = this.supabase.session() ?? (await this.supabase.client.auth.getSession()).data.session;
    const canUpdate = !!session && this.supabase.isPasswordRecovery();
    this.canUpdate.set(canUpdate);

    if (!canUpdate) {
      this.message.set('Abre el enlace de recuperacion enviado a tu correo para cambiar tu contrasena.');
    }
  }

  async submit(): Promise<void> {
    this.message.set('');
    const { password, confirmPassword } = this.form.getRawValue();

    if (!this.canUpdate()) {
      this.message.set('El enlace de recuperacion no es valido o ya expiro.');
      return;
    }

    if (password !== confirmPassword) {
      this.message.set('Las contrasenas no coinciden.');
      return;
    }

    this.loading.set(true);

    try {
      await this.supabase.updatePassword(password);
      await this.router.navigateByUrl('/ranking');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'No se pudo actualizar la contrasena.');
    } finally {
      this.loading.set(false);
    }
  }
}
