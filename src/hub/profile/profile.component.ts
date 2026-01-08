import { Component, computed, signal, effect } from '@angular/core';
import { ProfileService, GamingProfile, ShowcaseItem } from './profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  profile = this.profileService.myProfile;
  isEditing = signal(false);
  
  // Separate signals for editable fields
  editableHandle = signal('');
  editableBio = signal('');
  
  // Form for adding a new showcase item
  showcaseForm = signal<Partial<ShowcaseItem>>({ type: 'music', visibility: 'private' });

  constructor(private profileService: ProfileService) {
    // When editing starts, sync the editable signals with the profile data
    effect(() => {
      if (this.isEditing() && this.profile()) {
        this.editableHandle.set(this.profile()!.handle);
        this.editableBio.set(this.profile()!.bio);
      }
    });
  }

  toggleEdit() {
    const editing = !this.isEditing();
    this.isEditing.set(editing);
    if (!editing) { // When saving
      this.saveProfile();
    }
  }

  saveProfile() {
    this.profileService.updateProfile({
      handle: this.editableHandle(),
      bio: this.editableBio(),
    });
  }

  toggleVisibility(item: ShowcaseItem) {
    const updatedItem = { ...item, visibility: item.visibility === 'public' ? 'private' as const : 'public' as const };
    this.profileService.updateShowcaseItem(updatedItem);
  }

  addShowcaseItem() {
    const formValue = this.showcaseForm();
    if (formValue.title && formValue.url && formValue.imageUrl) {
      this.profileService.addShowcaseItem(formValue as Omit<ShowcaseItem, 'visibility'>);
      this.showcaseForm.set({ type: 'music', visibility: 'private' }); // Reset form
    }
  }
  
  updateShowcaseField<K extends keyof ShowcaseItem>(field: K, value: ShowcaseItem[K]) {
    this.showcaseForm.update(form => ({...form, [field]: value}));
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  getLink(type: string): string {
      const links = this.profile()?.links;
      return links ? links[type] : '';
  }
}
