import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: [   
     '../login/login.css',   
    './register.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  roles = [
    { value: 'CITOYEN', label: 'Citoyen' },
    { value: 'CHAUFFEUR', label: 'Chauffeur' },
    { value: 'GESTIONNAIRE', label: 'Gestionnaire' },
    { value: 'ADMIN_STP', label: 'Administrateur' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern('^[0-9]{8,15}$')]],
      role: ['CITOYEN', Validators.required],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmMotDePasse: ['', Validators.required],
      latitude: [null],
      longitude: [null]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('motDePasse')?.value;
    const confirm = group.get('confirmMotDePasse')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }



// Dans register.component.ts
passwordVisible = false;
confirmPasswordVisible = false;

togglePassword() {
    this.passwordVisible = !this.passwordVisible;
}

toggleConfirmPassword() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
}

// Méthode pour mot de passe oublié (login)
forgotPassword() {
    // Implémentez votre logique
    alert('Contactez support@stp-mauritanie.mr');
}


  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparer les données (sans confirmMotDePasse)
    const { confirmMotDePasse, ...userData } = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Inscription réussie ! Vous pouvez vous connecter.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Erreur lors de l\'inscription';
      }
    });
  }

  get f() {
    return this.registerForm.controls;
  }
}