/* ============================================================================
   AUTH.JS — Authentification Mukanda (version robuste)
   ============================================================================ */

// ============ CONFIGURATION ============
const AUTH_CONFIG = {
  SUPABASE_URL: 'https://wyfkogowsdbxctbpfuud.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZmtvZ293c2RieGN0YnBmdXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDc3MjAsImV4cCI6MjEwNjI4MzcyMH0.231eQ38RFvFaH3O6D-ReA8rlf3TehvWfcM-LBWocNEM',
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^0[56]\d{7}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// ============ INITIALISATION SUPABASE ============
let supabaseClient = null;

function initSupabase() {
  if (window.supabase && AUTH_CONFIG.SUPABASE_URL && AUTH_CONFIG.SUPABASE_ANON_KEY) {
    try {
      supabaseClient = window.supabase.createClient(
        AUTH_CONFIG.SUPABASE_URL,
        AUTH_CONFIG.SUPABASE_ANON_KEY
      );
      console.log('✅ Supabase initialisé');
      return true;
    } catch (error) {
      console.error('❌ Erreur Supabase:', error);
      return false;
    }
  }
  console.warn('⚠️ Supabase non disponible');
  return false;
}

// ============ UTILITAIRES ============
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function showAlert(boxId, message, type = 'error') {
  const box = $(boxId);
  if (!box) return;
  box.className = `form-alert form-alert-${type}`;
  const textEl = box.querySelector('.alert-text');
  if (textEl) textEl.textContent = message;
  box.style.display = 'flex';
}

function hideAlert(boxId) {
  const box = $(boxId);
  if (box) box.style.display = 'none';
}

function showError(errorId, message) {
  const el = $(errorId);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  const input = el.previousElementSibling?.querySelector('input, select');
  if (input) input.classList.add('error');
}

function clearError(errorId) {
  const el = $(errorId);
  if (!el) return;
  el.textContent = '';
  el.classList.remove('visible');
  const input = el.previousElementSibling?.querySelector('input, select');
  if (input) input.classList.remove('error');
}

function clearAllErrors(formId) {
  const form = $(formId);
  if (!form) return;
  form.querySelectorAll('.form-error').forEach(err => {
    err.textContent = '';
    err.classList.remove('visible');
  });
  form.querySelectorAll('.form-input, .form-select').forEach(input => {
    input.classList.remove('error');
  });
}

function setLoading(buttonId, loading) {
  const btn = $(buttonId);
  if (!btn) return;
  const btnText = btn.querySelector('.btn-text');
  const btnLoader = btn.querySelector('.btn-loader');
  
  if (loading) {
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-flex';
    btn.disabled = true;
  } else {
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
    btn.disabled = false;
  }
}

// ============ VALIDATION ============
function validateRequired(value) {
  return value && value.trim().length > 0;
}

function validateEmail(email) {
  return AUTH_CONFIG.EMAIL_REGEX.test(email);
}

function validatePhone(phone) {
  if (!phone || phone.trim() === '') return true;
  return AUTH_CONFIG.PHONE_REGEX.test(phone);
}

function validatePassword(password) {
  return password && password.length >= AUTH_CONFIG.PASSWORD_MIN_LENGTH;
}

function validatePasswordMatch(password, confirm) {
  return password === confirm;
}

// ============ GESTION DES TABS ============
function initTabs() {
  const tabs = $$('.auth-tab');
  const panels = $$('.auth-panel');
  
  if (tabs.length === 0) {
    console.warn('⚠️ Aucun tab trouvé');
    return;
  }

  function switchTab(tabName) {
    tabs.forEach(tab => {
      const isActive = tab.getAttribute('data-tab') === tabName;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    panels.forEach(panel => {
      const panelId = panel.id.replace('panel-', '');
      panel.classList.toggle('active', panelId === tabName);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Événements sur les tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Boutons de navigation
  const switchToRegister = $('#switchToRegister');
  const switchToLogin = $('#switchToLogin');
  const showForgot = $('#showForgot');
  const backToLogin = $('#backToLogin');

  if (switchToRegister) {
    switchToRegister.addEventListener('click', () => switchTab('register'));
  }
  if (switchToLogin) {
    switchToLogin.addEventListener('click', () => switchTab('login'));
  }
  if (showForgot) {
    showForgot.addEventListener('click', () => switchTab('forgot'));
  }
  if (backToLogin) {
    backToLogin.addEventListener('click', () => switchTab('login'));
  }

  console.log('✅ Tabs initialisés');
}

// ============ TOGGLE THÈME ============
function initTheme() {
  const themeToggle = $('#themeToggle');
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem('mukanda-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const icon = themeToggle.querySelector('.theme-icon');
  if (icon) icon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('mukanda-theme', newTheme);
    if (icon) icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });

  console.log('✅ Thème initialisé');
}

// ============ TOGGLE VISIBILITÉ MOT DE PASSE ============
function initPasswordToggle() {
  const toggles = $$('.password-toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = toggle.getAttribute('data-target');
      const input = $(`#${targetId}`);
      const icon = toggle.querySelector('.eye-icon');

      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.textContent = '🙈';
      } else {
        input.type = 'password';
        if (icon) icon.textContent = '👁️';
      }
    });
  });
  console.log('✅ Password toggle initialisé');
}

// ============ INDICATEUR DE FORCE DU MOT DE PASSE ============
function initPasswordStrength() {
  const passwordInput = $('#register-password');
  const strengthContainer = $('#password-strength');
  const strengthFill = $('#strength-fill');
  const strengthText = $('#strength-text');

  if (!passwordInput || !strengthContainer) return;

  function calculateStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    
    if (!password) {
      strengthContainer.style.display = 'none';
      return;
    }

    strengthContainer.style.display = 'block';
    const strength = calculateStrength(password);

    strengthFill.classList.remove('weak', 'medium', 'strong');
    strengthText.classList.remove('weak', 'medium', 'strong');
    strengthFill.classList.add(strength);
    strengthText.classList.add(strength);

    const texts = { weak: 'Faible', medium: 'Moyen', strong: 'Fort' };
    strengthText.textContent = texts[strength];
  });

  console.log('✅ Password strength initialisé');
}

// ============ FORMULAIRE DE CONNEXION ============
function initLoginForm() {
  const form = $('#loginForm');
  if (!form) {
    console.warn('⚠️ Formulaire login non trouvé');
    return;
  }

  const identifier = $('#login-identifier');
  const password = $('#login-password');

  // Validation en temps réel
  if (identifier) {
    identifier.addEventListener('blur', () => {
      if (!validateRequired(identifier.value)) {
        showError('#error-identifier', 'Ce champ est obligatoire');
      } else {
        clearError('#error-identifier');
      }
    });
    identifier.addEventListener('input', () => clearError('#error-identifier'));
  }

  if (password) {
    password.addEventListener('blur', () => {
      if (!validateRequired(password.value)) {
        showError('#error-password', 'Ce champ est obligatoire');
      } else {
        clearError('#error-password');
      }
    });
    password.addEventListener('input', () => clearError('#error-password'));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('🔄 Tentative de connexion...');

    const identifierValue = identifier?.value.trim() || '';
    const passwordValue = password?.value || '';

    clearAllErrors('#loginForm');
    hideAlert('#login-alert');

    let isValid = true;

    if (!validateRequired(identifierValue)) {
      showError('#error-identifier', 'Ce champ est obligatoire');
      isValid = false;
    }
    if (!validateRequired(passwordValue)) {
      showError('#error-password', 'Ce champ est obligatoire');
      isValid = false;
    }

    if (!isValid) {
      console.log('❌ Validation échouée');
      return;
    }

    if (!supabaseClient) {
      showAlert('#login-alert', 'Erreur de connexion. Actualise la page.', 'error');
      return;
    }

    setLoading('#login-submit', true);

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: identifierValue,
        password: passwordValue
      });

      if (error) {
        console.error('❌ Erreur connexion:', error.message);
        if (error.message.includes('Invalid login credentials')) {
          showAlert('#login-alert', 'Email/téléphone ou mot de passe incorrect', 'error');
        } else {
          showAlert('#login-alert', error.message, 'error');
        }
        return;
      }

      console.log('✅ Connexion réussie');
      showAlert('#login-alert', 'Connexion réussie !', 'success');
      
      setTimeout(() => {
        const next = new URLSearchParams(location.search).get('next');
        window.location.href = next || 'dashboard.html';
      }, 1000);

    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      showAlert('#login-alert', 'Erreur de connexion. Vérifie ta connexion internet.', 'error');
    } finally {
      setLoading('#login-submit', false);
    }
  });

  console.log('✅ Formulaire login initialisé');
}

// ============ FORMULAIRE D'INSCRIPTION ============
function initRegisterForm() {
  const form = $('#registerForm');
  if (!form) {
    console.warn('⚠️ Formulaire register non trouvé');
    return;
  }

  const name = $('#register-name');
  const email = $('#register-email');
  const phone = $('#register-phone');
  const level = $('#register-level');
  const password = $('#register-password');
  const passwordConfirm = $('#register-password-confirm');
  const terms = $('#accept-terms');

  // Validation en temps réel
  if (name) {
    name.addEventListener('blur', () => {
      if (!validateRequired(name.value)) showError('#error-name', 'Ce champ est obligatoire');
      else clearError('#error-name');
    });
    name.addEventListener('input', () => clearError('#error-name'));
  }

  if (email) {
    email.addEventListener('blur', () => {
      if (!validateEmail(email.value)) showError('#error-email', 'Adresse email invalide');
      else clearError('#error-email');
    });
    email.addEventListener('input', () => clearError('#error-email'));
  }

  if (phone) {
    phone.addEventListener('blur', () => {
      if (phone.value && !validatePhone(phone.value)) showError('#error-phone', 'Numéro invalide (ex: 065186967)');
      else clearError('#error-phone');
    });
    phone.addEventListener('input', () => clearError('#error-phone'));
  }

  if (level) {
    level.addEventListener('blur', () => {
      if (!validateRequired(level.value)) showError('#error-level', 'Ce champ est obligatoire');
      else clearError('#error-level');
    });
  }

  if (password) {
    password.addEventListener('blur', () => {
      if (!validatePassword(password.value)) showError('#error-password-reg', 'Minimum 8 caractères');
      else clearError('#error-password-reg');
    });
    password.addEventListener('input', () => clearError('#error-password-reg'));
  }

  if (passwordConfirm && password) {
    passwordConfirm.addEventListener('blur', () => {
      if (!validatePasswordMatch(password.value, passwordConfirm.value)) {
        showError('#error-password-confirm', 'Les mots de passe ne correspondent pas');
      } else {
        clearError('#error-password-confirm');
      }
    });
    passwordConfirm.addEventListener('input', () => clearError('#error-password-confirm'));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('🔄 Tentative d\'inscription...');

    const nameValue = name?.value.trim() || '';
    const emailValue = email?.value.trim() || '';
    const phoneValue = phone?.value.trim() || '';
    const levelValue = level?.value || '';
    const passwordValue = password?.value || '';
    const passwordConfirmValue = passwordConfirm?.value || '';
    const termsChecked = terms?.checked || false;

    clearAllErrors('#registerForm');
    hideAlert('#register-alert');

    let isValid = true;

    if (!validateRequired(nameValue)) {
      showError('#error-name', 'Ce champ est obligatoire');
      isValid = false;
    }
    if (!validateEmail(emailValue)) {
      showError('#error-email', 'Adresse email invalide');
      isValid = false;
    }
    if (phoneValue && !validatePhone(phoneValue)) {
      showError('#error-phone', 'Numéro invalide (ex: 065186967)');
      isValid = false;
    }
    if (!validateRequired(levelValue)) {
      showError('#error-level', 'Ce champ est obligatoire');
      isValid = false;
    }
    if (!validatePassword(passwordValue)) {
      showError('#error-password-reg', 'Minimum 8 caractères');
      isValid = false;
    }
    if (!validatePasswordMatch(passwordValue, passwordConfirmValue)) {
      showError('#error-password-confirm', 'Les mots de passe ne correspondent pas');
      isValid = false;
    }
    if (!termsChecked) {
      showError('#error-terms', 'Tu dois accepter les conditions générales');
      isValid = false;
    }

    if (!isValid) {
      console.log('❌ Validation échouée');
      return;
    }

    if (!supabaseClient) {
      showAlert('#register-alert', 'Erreur de connexion. Actualise la page.', 'error');
      return;
    }

    setLoading('#register-submit', true);

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: emailValue,
        password: passwordValue,
        options: {
          data: {
            nom: nameValue,
            telephone: phoneValue,
            niveau_scolaire: levelValue
          }
        }
      });

      if (error) {
        console.error('❌ Erreur inscription:', error.message);
        if (error.message.includes('already registered')) {
          showAlert('#register-alert', 'Un compte existe déjà avec cet email', 'error');
        } else {
          showAlert('#register-alert', error.message, 'error');
        }
        return;
      }

      console.log('✅ Inscription réussie');

      // Afficher le modal de bienvenue
      const welcomeModal = $('#welcomeModal');
      if (welcomeModal) {
        welcomeModal.style.display = 'flex';
        
        const goToDashboard = $('#goToDashboard');
        if (goToDashboard) {
          goToDashboard.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
          });
        }

        const overlay = welcomeModal.querySelector('.welcome-modal-overlay');
        if (overlay) {
          overlay.addEventListener('click', () => {
            welcomeModal.style.display = 'none';
          });
        }
      } else {
        // Pas de modal, redirection directe
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      showAlert('#register-alert', 'Erreur lors de la création du compte', 'error');
    } finally {
      setLoading('#register-submit', false);
    }
  });

  console.log('✅ Formulaire register initialisé');
}

// ============ FORMULAIRE MOT DE PASSE OUBLIÉ ============
function initForgotForm() {
  const form = $('#forgotForm');
  if (!form) {
    console.warn('⚠️ Formulaire forgot non trouvé');
    return;
  }

  const email = $('#forgot-email');

  if (email) {
    email.addEventListener('blur', () => {
      if (!validateEmail(email.value)) {
        showError('#error-forgot-email', 'Adresse email invalide');
      } else {
        clearError('#error-forgot-email');
      }
    });
    email.addEventListener('input', () => clearError('#error-forgot-email'));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('🔄 Réinitialisation mot de passe...');

    const emailValue = email?.value.trim() || '';

    clearAllErrors('#forgotForm');
    hideAlert('#forgot-alert');
    hideAlert('#forgot-success');

    if (!validateEmail(emailValue)) {
      showError('#error-forgot-email', 'Adresse email invalide');
      return;
    }

    if (!supabaseClient) {
      showAlert('#forgot-alert', 'Erreur de connexion. Actualise la page.', 'error');
      return;
    }

    setLoading('#forgot-submit', true);

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(emailValue, {
        redirectTo: `${window.location.origin}/reset-password.html`
      });

      if (error) {
        console.error('❌ Erreur réinitialisation:', error.message);
        showAlert('#forgot-alert', error.message, 'error');
        return;
      }

      console.log('✅ Email envoyé');
      const successBox = $('#forgot-success');
      if (successBox) {
        successBox.style.display = 'flex';
      }
      if (email) email.value = '';

    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      showAlert('#forgot-alert', 'Erreur de connexion. Vérifie ta connexion internet.', 'error');
    } finally {
      setLoading('#forgot-submit', false);
    }
  });

  console.log('✅ Formulaire forgot initialisé');
}

// ============ INITIALISATION GLOBALE ============
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initialisation auth.js...');

  // Initialiser Supabase
  initSupabase();

  // Initialiser tous les composants
  initTheme();
  initTabs();
  initPasswordToggle();
  initPasswordStrength();
  initLoginForm();
  initRegisterForm();
  initForgotForm();

  console.log('✅ Auth.js prêt');
});