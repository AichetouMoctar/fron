// src/app/pages/register/register.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  passwordVisible = false;
  confirmPasswordVisible = false;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/map']);
      return;
    }

    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmMotDePasse: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('motDePasse')?.value;
    const confirm = group.get('confirmMotDePasse')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPassword(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Envoyer seulement nom, email, telephone, motDePasse
    const { confirmMotDePasse, ...userData } = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Inscription réussie ! Redirection vers la connexion...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || "Erreur lors de l'inscription";
      }
    });
  }

  get f() { return this.registerForm.controls; }
}

