import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations!);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', (document.getElementById('name') as HTMLInputElement).value);
    form.append('email', (document.getElementById('email') as HTMLInputElement).value);
    const photoInput = document.getElementById('photo') as HTMLInputElement;
    form.append('photo', photoInput.files![0]);
    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.querySelector('.btn-save-password') as HTMLButtonElement;
    btn.textContent = 'Updating...';

    const passwordCurrent = (document.getElementById('password-current') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const passwordConfirm = (document.getElementById('password-confirm') as HTMLInputElement).value;
    await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');

    btn.textContent = 'Save password';
    (document.getElementById('password-current') as HTMLInputElement).value = '';
    (document.getElementById('password') as HTMLInputElement).value = '';
    (document.getElementById('password-confirm') as HTMLInputElement).value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    const target = e.target as HTMLButtonElement;
    target.textContent = 'Processing...';
    const { tourId } = (target as HTMLElement & { dataset: { tourId: string } }).dataset;
    bookTour(tourId);
  });
}
