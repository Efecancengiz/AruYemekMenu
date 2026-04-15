import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const authForm = document.getElementById('auth-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submit-btn');
    const errorMessage = document.getElementById('error-message');

    // Check auth state. If already logged in, redirect to dashboard.
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });



    // Handle form submission
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showError("Lütfen e-posta ve şifrenizi giriniz.");
            return;
        }

        try {
            // Disable button during req
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="opacity-75">Bekleyiniz...</span>';

            // Login
            await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener will automatically redirect
        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Giriş Yap';
            
            // Translate common Firebase Auth errors
            let msg = 'Bir hata oluştu.';
            switch(error.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    msg = 'E-posta veya şifre hatalı!';
                    break;
                case 'auth/email-already-in-use':
                    msg = 'Bu e-posta adresi ile zaten kayıt olunmuş.';
                    break;
                case 'auth/weak-password':
                    msg = 'Şifre çok zayıf. En az 6 karakter olmalıdır.';
                    break;
                case 'auth/invalid-email':
                    msg = 'Geçersiz bir e-posta adresi girdiniz.';
                    break;
                default:
                    msg = error.message;
            }
            showError(msg);
        }
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    }
});
