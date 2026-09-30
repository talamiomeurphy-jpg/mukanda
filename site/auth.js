/* ============================================================================
   AUTH.JS — Logique complète d'authentification Mukanda
   Gère : connexion, inscription, mot de passe oublié, validation, thème
   ============================================================================ */

// ============ CONFIGURATION ============
const AUTH_CONFIG = {
  SUPABASE_URL: 'https://wyfkogowsdbxctbpfuud.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZmtvZ293c2RieGN0YnBmdXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDc3MjAsImV4cCI6MjEwNjI4MzcyMH0.231eQ38RFvFaH3O6D-ReA8rlf3TehvWfcM-LBWocNEM',
  
  // Validation
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^0[56]\d{7}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Messages d'erreur
  ERRORS: {
    REQUIRED: 'Ce champ est obligatoire',
    EMAIL_INVALID: 'Adresse email invalide',
    PHONE_INVALID: 'Numéro de téléphone invalide (ex: 065186967)',
    PASSWORD_WEAK: 'Le mot de passe doit contenir au moins 8 caractères',
    PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
    TERMS_REQUIRED: 'Tu dois accepter les conditions générales',
    LOGIN_FAILED: 'Email/téléphone ou mot de passe incorrect',
    REGISTER_FAILED: 'Erreur lors de la création du compte',
    NETWORK_ERROR: 'Erreur de connexion. Vérifie ta connexion internet.',
    EMAIL_EXISTS: 'Un compte existe déjà avec cet email',
  },
  
  // Messages de succès
  SUCCESS: {
    LOGIN: 'Connexion réussie !',
    REGISTER: 'Compte créé avec succès !',
    RESET_SENT: 'Email de réinitialisation envoyé',
  }
};

// ============ INITIALISATION SUPABASE ============
let supabase;

try {
  if (window.supabase && AUTH_CONFIG.SUPABASE_URL && AUTH_CONFIG.SUPABASE_ANON_KEY) {
    supabase = window.supabase.createClient(
      AUTH_CONFIG.SUPABASE_URL,
      AUTH_CONFIG.SUPABASE_ANON_KEY
    );
  }
} catch (error) {
  console.error('Erreur initialisation Supabase:', error);
}

// ============ GESTION DU THÈME ============
class ThemeManager {
  constructor() {
    this.themeKey = 'mukanda-theme';
    this.themeToggle = document.getElementById('themeToggle');
    this.init();
  }

  init() {
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem(this.themeKey) || 'light';
    this.setTheme(savedTheme);

    // Écouter le bouton de bascule
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.themeKey, theme);
    this.updateIcon(theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  updateIcon(theme) {
    if (!this.themeToggle) return;
    const icon = this.themeToggle.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }
}

// ============ GESTION DES TABS ============
class TabManager {
  constructor() {
    this.tabs = document.querySelectorAll('.auth-tab');
    this.panels = document.querySelectorAll('.auth-panel');
    this.init();
  }

  init() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Boutons de navigation
    this.setupNavigationButtons();
  }

  switchTab(tabName) {
    // Mettre à jour les tabs
    this.tabs.forEach(tab => {
      const isActive = tab.getAttribute('data-tab') === tabName;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    // Mettre à jour les panneaux
    this.panels.forEach(panel => {
      const panelId = panel.id.replace('panel-', '');
      panel.classList.toggle('active', panelId === tabName);
    });

    // Scroll vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setupNavigationButtons() {
    // Switch vers inscription
    const switchToRegister = document.getElementById('switchToRegister');
    if (switchToRegister) {
      switchToRegister.addEventListener('click', () => this.switchTab('register'));
    }

    // Switch vers connexion
    const switchToLogin = document.getElementById('switchToLogin');
    if (switchToLogin) {
      switchToLogin.addEventListener('click', () => this.switchTab('login'));
    }

    // Mot de passe oublié
    const showForgot = document.getElementById('showForgot');
    if (showForgot) {
      showForgot.addEventListener('click', () => this.switchTab('forgot'));
    }

    // Retour à la connexion
    const backToLogin = document.getElementById('backToLogin');
    if (backToLogin) {
      backToLogin.addEventListener('click', () => this.switchTab('login'));
    }
  }
}

// ============ VALIDATION DE FORMULAIRE ============
class FormValidator {
  static validateRequired(value) {
    return value && value.trim().length > 0;
  }

  static validateEmail(email) {
    return AUTH_CONFIG.EMAIL_REGEX.test(email);
  }

  static validatePhone(phone) {
    if (!phone || phone.trim() === '') return true; // Optionnel
    return AUTH_CONFIG.PHONE_REGEX.test(phone);
  }

  static validatePassword(password) {
    return password && password.length >= AUTH_CONFIG.PASSWORD_MIN_LENGTH;
  }

  static validatePasswordMatch(password, confirm) {
    return password === confirm;
  }

  static showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.classList.add('visible');
      
      // Trouver le champ associé
      const input = element.previousElementSibling?.querySelector('input, select');
      if (input) {
        input.classList.add('error');
      }
    }
  }

  static clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = '';
      element.classList.remove('visible');
      
      const input = element.previousElementSibling?.querySelector('input, select');
      if (input) {
        input.classList.remove('error');
      }
    }
  }

  static clearAllErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.querySelectorAll('.form-error').forEach(err => {
      err.textContent = '';
      err.classList.remove('visible');
    });
    
    form.querySelectorAll('.form-input, .form-select').forEach(input => {
      input.classList.remove('error');
    });
  }
}

// ============ INDICATEUR DE FORCE DU MOT DE PASSE ============
class PasswordStrength {
  constructor() {
    this.passwordInput = document.getElementById('register-password');
    this.strengthContainer = document.getElementById('password-strength');
    this.strengthFill = document.getElementById('strength-fill');
    this.strengthText = document.getElementById('strength-text');
    this.init();
  }

  init() {
    if (!this.passwordInput) return;

    this.passwordInput.addEventListener('input', () => {
      this.updateStrength();
    });
  }

  updateStrength() {
    const password = this.passwordInput.value;
    
    if (!password) {
      this.strengthContainer.style.display = 'none';
      return;
    }

    this.strengthContainer.style.display = 'block';
    
    const strength = this.calculateStrength(password);
    this.displayStrength(strength);
  }

  calculateStrength(password) {
    let score = 0;
    
    // Longueur
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Minuscules
    if (/[a-z]/.test(password)) score++;
    
    // Majuscules
    if (/[A-Z]/.test(password)) score++;
    
    // Chiffres
    if (/\d/.test(password)) score++;
    
    // Caractères spéciaux
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  displayStrength(strength) {
    // Retirer les anciennes classes
    this.strengthFill.classList.remove('weak', 'medium', 'strong');
    this.strengthText.classList.remove('weak', 'medium', 'strong');

    // Ajouter la nouvelle classe
    this.strengthFill.classList.add(strength);
    this.strengthText.classList.add(strength);

    // Mettre à jour le texte
    const texts = {
      weak: 'Faible',
      medium: 'Moyen',
      strong: 'Fort'
    };
    this.strengthText.textContent = texts[strength];
  }
}

// ============ TOGGLE VISIBILITÉ MOT DE PASSE ============
class PasswordToggle {
  constructor() {
    this.init();
  }

  init() {
    const toggles = document.querySelectorAll('.password-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.togglePassword(toggle);
      });
    });
  }

  togglePassword(button) {
    const targetId = button.getAttribute('data-target');
    const input = document.getElementById(targetId);
    const icon = button.querySelector('.eye-icon');

    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = '🙈';
    } else {
      input.type = 'password';
      icon.textContent = '👁️';
    }
  }
}

// ============ FORMULAIRE DE CONNEXION ============
class LoginForm {
  constructor() {
    this.form = document.getElementById('loginForm');
    this.submitBtn = document.getElementById('login-submit');
    this.alertBox = document.getElementById('login-alert');
    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Validation en temps réel
    this.setupRealtimeValidation();
  }

  setupRealtimeValidation() {
    const identifier = document.getElementById('login-identifier');
    const password = document.getElementById('login-password');

    if (identifier) {
      identifier.addEventListener('blur', () => {
        this.validateIdentifier(identifier.value);
      });
      identifier.addEventListener('input', () => {
        FormValidator.clearError('error-identifier');
      });
    }

    if (password) {
      password.addEventListener('blur', () => {
        this.validatePassword(password.value);
      });
      password.addEventListener('input', () => {
        FormValidator.clearError('error-password');
      });
    }
  }

  validateIdentifier(value) {
    if (!FormValidator.validateRequired(value)) {
      FormValidator.showError('error-identifier', AUTH_CONFIG.ERRORS.REQUIRED);
      return false;
    }
    FormValidator.clearError('error-identifier');
    return true;
  }

  validatePassword(value) {
    if (!FormValidator.validateRequired(value)) {
      FormValidator.showError('error-password', AUTH_CONFIG.ERRORS.REQUIRED);
      return false;
    }
    FormValidator.clearError('error-password');
    return true;
  }

  async handleSubmit() {
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-me').checked;

    // Validation
    FormValidator.clearAllErrors('loginForm');
    this.hideAlert();

    let isValid = true;
    isValid = this.validateIdentifier(identifier) && isValid;
    isValid = this.validatePassword(password) && isValid;

    if (!isValid) return;

    // Désactiver le bouton
    this.setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase non initialisé');
      }

      // Connexion Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier, // Supabase gère email ou téléphone
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          this.showAlert(AUTH_CONFIG.ERRORS.LOGIN_FAILED, 'error');
        } else {
          this.showAlert(error.message, 'error');
        }
        return;
      }

      // Sauvegarder la session
      if (remember) {
        localStorage.setItem('mukanda-session', JSON.stringify(data.session));
      }

      // Redirection vers le dashboard
      this.showAlert(AUTH_CONFIG.SUCCESS.LOGIN, 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);

    } catch (error) {
      console.error('Erreur connexion:', error);
      this.showAlert(AUTH_CONFIG.ERRORS.NETWORK_ERROR, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(loading) {
    const btnText = this.submitBtn.querySelector('.btn-text');
    const btnLoader = this.submitBtn.querySelector('.btn-loader');

    if (loading) {
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      this.submitBtn.disabled = true;
    } else {
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
      this.submitBtn.disabled = false;
    }
  }

  showAlert(message, type = 'error') {
    this.alertBox.className = `form-alert form-alert-${type}`;
    this.alertBox.querySelector('.alert-text').textContent = message;
    this.alertBox.style.display = 'flex';
  }

  hideAlert() {
    this.alertBox.style.display = 'none';
  }
}

// ============ FORMULAIRE D'INSCRIPTION ============
class RegisterForm {
  constructor() {
    this.form = document.getElementById('registerForm');
    this.submitBtn = document.getElementById('register-submit');
    this.alertBox = document.getElementById('register-alert');
    this.welcomeModal = document.getElementById('welcomeModal');
    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Validation en temps réel
    this.setupRealtimeValidation();
  }

  setupRealtimeValidation() {
    const fields = [
      { id: 'register-name', errorId: 'error-name', validator: (v) => FormValidator.validateRequired(v), error: AUTH_CONFIG.ERRORS.REQUIRED },
      { id: 'register-email', errorId: 'error-email', validator: FormValidator.validateEmail, error: AUTH_CONFIG.ERRORS.EMAIL_INVALID },
      { id: 'register-phone', errorId: 'error-phone', validator: FormValidator.validatePhone, error: AUTH_CONFIG.ERRORS.PHONE_INVALID },
      { id: 'register-level', errorId: 'error-level', validator: (v) => FormValidator.validateRequired(v), error: AUTH_CONFIG.ERRORS.REQUIRED },
      { id: 'register-password', errorId: 'error-password-reg', validator: FormValidator.validatePassword, error: AUTH_CONFIG.ERRORS.PASSWORD_WEAK },
    ];

    fields.forEach(field => {
      const input = document.getElementById(field.id);
      if (input) {
        input.addEventListener('blur', () => {
          if (!field.validator(input.value)) {
            FormValidator.showError(field.errorId, field.error);
          }
        });
        input.addEventListener('input', () => {
          FormValidator.clearError(field.errorId);
        });
      }
    });

    // Confirmation mot de passe
    const confirmInput = document.getElementById('register-password-confirm');
    const passwordInput = document.getElementById('register-password');
    if (confirmInput && passwordInput) {
      confirmInput.addEventListener('blur', () => {
        if (!FormValidator.validatePasswordMatch(passwordInput.value, confirmInput.value)) {
          FormValidator.showError('error-password-confirm', AUTH_CONFIG.ERRORS.PASSWORD_MISMATCH);
        }
      });
      confirmInput.addEventListener('input', () => {
        FormValidator.clearError('error-password-confirm');
      });
    }
  }

  async handleSubmit() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const level = document.getElementById('register-level').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const terms = document.getElementById('accept-terms').checked;

    // Validation
    FormValidator.clearAllErrors('registerForm');
    this.hideAlert();

    let isValid = true;

    if (!FormValidator.validateRequired(name)) {
      FormValidator.showError('error-name', AUTH_CONFIG.ERRORS.REQUIRED);
      isValid = false;
    }

    if (!FormValidator.validateEmail(email)) {
      FormValidator.showError('error-email', AUTH_CONFIG.ERRORS.EMAIL_INVALID);
      isValid = false;
    }

    if (phone && !FormValidator.validatePhone(phone)) {
      FormValidator.showError('error-phone', AUTH_CONFIG.ERRORS.PHONE_INVALID);
      isValid = false;
    }

    if (!FormValidator.validateRequired(level)) {
      FormValidator.showError('error-level', AUTH_CONFIG.ERRORS.REQUIRED);
      isValid = false;
    }

    if (!FormValidator.validatePassword(password)) {
      FormValidator.showError('error-password-reg', AUTH_CONFIG.ERRORS.PASSWORD_WEAK);
      isValid = false;
    }

    if (!FormValidator.validatePasswordMatch(password, passwordConfirm)) {
      FormValidator.showError('error-password-confirm', AUTH_CONFIG.ERRORS.PASSWORD_MISMATCH);
      isValid = false;
    }

    if (!terms) {
      FormValidator.showError('error-terms', AUTH_CONFIG.ERRORS.TERMS_REQUIRED);
      isValid = false;
    }

    if (!isValid) return;

    // Désactiver le bouton
    this.setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase non initialisé');
      }

      // Inscription Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            nom: name,
            telephone: phone,
            niveau_scolaire: level,
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          this.showAlert(AUTH_CONFIG.ERRORS.EMAIL_EXISTS, 'error');
        } else {
          this.showAlert(error.message, 'error');
        }
        return;
      }

      // Afficher le modal de bienvenue
      this.showWelcomeModal();

    } catch (error) {
      console.error('Erreur inscription:', error);
      this.showAlert(AUTH_CONFIG.ERRORS.REGISTER_FAILED, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(loading) {
    const btnText = this.submitBtn.querySelector('.btn-text');
    const btnLoader = this.submitBtn.querySelector('.btn-loader');

    if (loading) {
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      this.submitBtn.disabled = true;
    } else {
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
      this.submitBtn.disabled = false;
    }
  }

  showAlert(message, type = 'error') {
    this.alertBox.className = `form-alert form-alert-${type}`;
    this.alertBox.querySelector('.alert-text').textContent = message;
    this.alertBox.style.display = 'flex';
  }

  hideAlert() {
    this.alertBox.style.display = 'none';
  }

  showWelcomeModal() {
    if (this.welcomeModal) {
      this.welcomeModal.style.display = 'flex';
      
      // Bouton pour aller au dashboard
      const goToDashboard = document.getElementById('goToDashboard');
      if (goToDashboard) {
        goToDashboard.addEventListener('click', () => {
          window.location.href = 'dashboard.html';
        });
      }

      // Fermer le modal en cliquant sur l'overlay
      const overlay = this.welcomeModal.querySelector('.welcome-modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', () => {
          this.welcomeModal.style.display = 'none';
        });
      }
    }
  }
}

// ============ FORMULAIRE MOT DE PASSE OUBLIÉ ============
class ForgotForm {
  constructor() {
    this.form = document.getElementById('forgotForm');
    this.submitBtn = document.getElementById('forgot-submit');
    this.alertBox = document.getElementById('forgot-alert');
    this.successBox = document.getElementById('forgot-success');
    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Validation en temps réel
    const emailInput = document.getElementById('forgot-email');
    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        if (!FormValidator.validateEmail(emailInput.value)) {
          FormValidator.showError('error-forgot-email', AUTH_CONFIG.ERRORS.EMAIL_INVALID);
        }
      });
      emailInput.addEventListener('input', () => {
        FormValidator.clearError('error-forgot-email');
      });
    }
  }

  async handleSubmit() {
    const email = document.getElementById('forgot-email').value.trim();

    // Validation
    FormValidator.clearAllErrors('forgotForm');
    this.hideAlert();
    this.hideSuccess();

    if (!FormValidator.validateEmail(email)) {
      FormValidator.showError('error-forgot-email', AUTH_CONFIG.ERRORS.EMAIL_INVALID);
      return;
    }

    // Désactiver le bouton
    this.setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase non initialisé');
      }

      // Réinitialisation Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`,
      });

      if (error) {
        this.showAlert(error.message, 'error');
        return;
      }

      // Afficher le message de succès
      this.showSuccess();

    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      this.showAlert(AUTH_CONFIG.ERRORS.NETWORK_ERROR, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(loading) {
    const btnText = this.submitBtn.querySelector('.btn-text');
    const btnLoader = this.submitBtn.querySelector('.btn-loader');

    if (loading) {
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      this.submitBtn.disabled = true;
    } else {
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
      this.submitBtn.disabled = false;
    }
  }

  showAlert(message, type = 'error') {
    this.alertBox.className = `form-alert form-alert-${type}`;
    this.alertBox.querySelector('.alert-text').textContent = message;
    this.alertBox.style.display = 'flex';
  }

  hideAlert() {
    this.alertBox.style.display = 'none';
  }

  showSuccess() {
    this.successBox.style.display = 'flex';
    this.form.querySelector('#forgot-email').value = '';
  }

  hideSuccess() {
    this.successBox.style.display = 'none';
  }
}

// ============ INITIALISATION ============
document.addEventListener('DOMContentLoaded', () => {
  // Gestion du thème
  new ThemeManager();

  // Gestion des tabs
  new TabManager();

  // Indicateur de force du mot de passe
  new PasswordStrength();

  // Toggle visibilité mot de passe
  new PasswordToggle();

  // Formulaires
  new LoginForm();
  new RegisterForm();
  new ForgotForm();

  // Vérifier si l'utilisateur est déjà connecté
  if (supabase) {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Rediriger vers le dashboard si déjà connecté
        window.location.href = 'dashboard.html';
      }
    });
  }
});

// ============ UTILITAIRES ============
const Utils = {
  // Formater le numéro de téléphone
  formatPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 9) {
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
    }
    return phone;
  },

  // Valider le format du numéro congolais
  isValidCongolesePhone(phone) {
    return AUTH_CONFIG.PHONE_REGEX.test(phone);
  },

  // Générer un mot de passe aléatoire
  generatePassword(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  },

  // Copier dans le presse-papier
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Erreur copie:', error);
      return false;
    }
  },

  // Debounce pour les recherches
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Export pour utilisation globale
window.MukandaAuth = {
  Utils,
  FormValidator,
  ThemeManager,
  TabManager,
  PasswordStrength,
  PasswordToggle,
  LoginForm,
  RegisterForm,
  ForgotForm
};