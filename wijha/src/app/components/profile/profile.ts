import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { ProfileService } from '../../services/profile';
import { Utilisateur } from '../../models/auth/utilisateur.model';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  user: Utilisateur | null = null;
  isLoading = true;
  error: string | null = null;

  // Statistiques (simples, juste pour le nombre de trajets)
  stats = {
    trips: 124  // Valeur fictive, à remplacer par des données réelles si disponibles
  };

  // Modal d'édition
  showEditModal = false;
  editForm: FormGroup;
  isSaving = false;

  // Modal de suppression
  showDeleteModal = false;
  isDeleting = false;

  // Notification
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor() {
    this.editForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.pattern(/^[0-9+\-\s]{10,20}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.editForm.patchValue({
          nom: user.nom,
          telephone: user.telephone || ''
        });
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Impossible de charger le profil';
        this.isLoading = false;
        this.showNotificationMessage('Erreur de chargement', 'error');
      }
    });
  }

  // Actions de la bannière
  onUploadPhoto() {
    this.showNotificationMessage('Changer la photo (simulation)', 'success');
  }

  onEditCover() {
    this.showNotificationMessage('Changer la couverture (simulation)', 'success');
  }

  // Modification du profil
  onEditProfile() {
    if (this.user) {
      this.editForm.patchValue({
        nom: this.user.nom,
        telephone: this.user.telephone || ''
      });
    }
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  saveProfile() {
    if (this.editForm.invalid) return;

    this.isSaving = true;
    const updatedData = this.editForm.value;
    this.profileService.updateProfile(updatedData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isSaving = false;
        this.showEditModal = false;
        this.showNotificationMessage('Profil mis à jour', 'success');
      },
      error: () => {
        this.isSaving = false;
        this.showNotificationMessage('Erreur de mise à jour', 'error');
      }
    });
  }

  // Suppression de compte
  onDeleteAccount() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDelete() {
    this.isDeleting = true;
    this.profileService.deleteAccount().subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.authService.logout(); // Redirige vers login
      },
      error: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.showNotificationMessage('Erreur de suppression', 'error');
      }
    });
  }

  // Planifier un trajet (simulation)
  onPlanTrip() {
    this.showNotificationMessage('Recherche de trajets...', 'success');
  }

  // Notification
  private showNotificationMessage(message: string, type: 'success' | 'error' = 'success') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    setTimeout(() => this.showNotification = false, 3000);
  }
}