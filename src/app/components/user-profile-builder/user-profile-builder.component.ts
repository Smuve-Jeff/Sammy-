import { Component, ChangeDetectionStrategy, signal, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-profile-builder',
  templateUrl: './user-profile-builder.component.html',
  styleUrls: ['./user-profile-builder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileBuilderComponent {
  @Output() profileSaved = new EventEmitter<void>();
  artistName = signal('');
  bio = signal('');
  profilePictureUrl = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => this.profilePictureUrl.set(e.target?.result as string);
      reader.readAsDataURL(input.files[0]);
    }
  }

  saveProfile(): void {
    // In a real application, you would save the profile data to a service.
    // For now, we'll just emit an event to signal that the profile has been "saved".
    this.profileSaved.emit();
  }
}
