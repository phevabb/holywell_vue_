<template>
  <div class="page-container">
    <div>

      
  
  
</div>

    <div class="form-container">
      <h1 class="form-title">
        <i class="fas fa-key"></i> Reset Your Password
      </h1>

      <div v-if="validLink">
        <p class="form-description">
          Create a new secure password to protect your account. Make sure it's strong and unique.
        </p>

        <transition name="fade">
          <div v-if="success" class="success-message">
            <i class="fas fa-check-circle"></i> Password successfully updated! You can now log in with your new password.
          </div>
        </transition>
        
        <form @submit.prevent="handleSubmit">
          <div class="input-group">
            <label class="input-label">
              New Password
            </label>
            <div class="input-wrapper">
              <input
                :type="showPassword1 ? 'text' : 'password'"
                v-model="password1"
                @input="updatePasswordStrength"
                required
                placeholder="Enter your new password"
                class="form-input"
              />
              <button type="button" class="password-toggle" @click="showPassword1 = !showPassword1">
                <i :class="showPassword1 ? 'far fa-eye-slash' : 'far fa-eye'"></i>
              </button>
            </div>
            
            <div class="password-strength" v-if="password1">
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :style="{ 
                    'width': passwordStrength + '%', 
                    'background': passwordStrength < 50 ? '#e53e3e' : (passwordStrength < 75 ? '#dd6b20' : '#38a169') 
                  }"
                ></div>
              </div>
              <div class="strength-text">
                Strength: 
                <span v-if="passwordStrength < 50">Weak</span>
                <span v-else-if="passwordStrength < 75">Medium</span>
                <span v-else>Strong</span>
              </div>
            </div>
          </div>
          
          <div class="input-group">
            <label class="input-label">
              Confirm Password
            </label>
            <div class="input-wrapper">
              <input
                :type="showPassword2 ? 'text' : 'password'"
                v-model="password2"
                required
                placeholder="Confirm your new password"
                class="form-input"
              />
              <button type="button" class="password-toggle" @click="showPassword2 = !showPassword2">
                <i :class="showPassword2 ? 'far fa-eye-slash' : 'far fa-eye'"></i>
              </button>
            </div>
          </div>
          
          <transition name="fade-shake">
            <div v-if="error" class="error-message">
              <i class="fas fa-exclamation-circle"></i> {{ error }}
            </div>
          </transition>
          
          <button type="submit" class="submit-button" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>Change My Password</span>
          </button>
        </form>
      </div>
      
      <div v-else class="invalid-link-message">
        <i class="fas fa-exclamation-triangle"></i> The password reset link was invalid, possibly because it has already been used. Please request a new password reset.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import { resetpasswordconfirm } from "@/services/api";



const validLink = ref(true);
const password1 = ref("");
const password2 = ref("");
const error = ref("");
const success = ref(false);
const loading = ref(false);
const passwordStrength = ref(0);
const showPassword1 = ref(false);
const showPassword2 = ref(false);

const router = useRouter();
const hash = window.location.hash;  
console.log("HASH:", hash);

// "#/reset-password-confirm/NA/<token>"
const segments = hash.replace("#", "").split("/");

console.log("Segments:", segments);

// ["", "reset-password-confirm", "NA", "<token>"]
const uidb64 = segments[2];
const token = segments[3];



onMounted(() => {

});

const calculatePasswordStrength = (password) => {
  if (!password) return 0;

  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;

  return strength;
};

async function handleSubmit() {
  if (password1.value !== password2.value) {
    error.value = "⚠️ Passwords do not match";
    return;
  }
  if (password1.value.length < 8) {
    error.value = "⚠️ Password must be at least 8 characters";
    return;
  }

  error.value = "";
  loading.value = true;

  try {
    const payload = {
  uidb64,                 // not uid
  token,
  new_password1: password1.value,
  new_password2: password2.value,
};

console.log("payload:", payload);   


    const response = await resetpasswordconfirm(payload);

    success.value = true;
   

    // Clear fields after success
    password1.value = "";
    password2.value = "";

    router.push("/password-reset-success");
  } catch (err) {
    if (err.response?.data) {
  const tokenErrors = err.response.data.token; // should be an array
  if (tokenErrors && tokenErrors[0] === "Invalid or expired token.") {
    error.value = "The password reset link is invalid or has expired. Please request a new password reset.";
  } else {
    error.value = tokenErrors ? tokenErrors[0] : "An unexpected error occurred.";
  }

} else {
  error.value = "❌ Something went wrong. Please try again.";
}

  } finally {
    loading.value = false;
  }
}

const updatePasswordStrength = () => {
  passwordStrength.value = calculatePasswordStrength(password1.value);
};
</script>


<style scoped>
/* Page and Container Styles */
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d6d8e2 0%, #e5deeb 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-container::before, .page-container::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  opacity: 0.1;
  z-index: 0;
}

.page-container::before {
  background: linear-gradient(45deg, #48c6ef, #6f86d6);
  top: -150px;
  left: -150px;
  animation: float 15s ease-in-out infinite;
}

.page-container::after {
  background: linear-gradient(45deg, #ff9a9e, #fad0c4);
  bottom: -150px;
  right: -150px;
  animation: float 18s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(30px, 30px) rotate(180deg); }
}

.form-container {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  transform: translateY(0);
  transition: all 0.4s ease;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.form-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(to bottom right, rgba(255,255,255,0.2), rgba(255,255,255,0));
  transform: rotate(30deg);
  z-index: -1;
}

.form-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  padding-bottom: 15px;
}

.form-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(to right, #667eea, #764ba2);
  border-radius: 2px;
}

.form-description {
  color: #718096;
  text-align: center;
  margin-bottom: 30px;
  line-height: 1.6;
}

/* Form Element Styles */
.input-group {
  margin-bottom: 24px;
  position: relative;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 16px 48px 16px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.7);
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #667eea;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  overflow: hidden;
  margin-bottom: 6px;
}

.strength-fill {
  height: 100%;
  width: 0%;
  border-radius: 3px;
  transition: all 0.4s ease;
}

.strength-text {
  font-size: 12px;
  color: #718096;
}

.submit-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s ease;
}

.submit-button:hover::before {
  left: 100%;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.submit-button:active {
  transform: translateY(0);
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Message Styles & Animations */
.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.error-message i {
  margin-right: 8px;
}

.success-message {
  background: #c6f6d5;
  color: #2f855a;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.invalid-link-message {
  background: #fed7d7;
  color: #c53030;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  animation: pulse 2s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15%, 45%, 75% { transform: translateX(-10px); }
  30%, 60%, 90% { transform: translateX(10px); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(245, 101, 101, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(245, 101, 101, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 101, 101, 0); }
}

/* Transition for success and error messages */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-shake-enter-active {
  animation: fadeIn 0.5s ease-in-out;
}
.fade-shake-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-shake-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-shake-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-shake-enter-to {
  animation: shake 0.5s ease-in-out;
}

/* Responsive Styles */
@media (max-width: 640px) {
  .form-container {
    padding: 24px;
  }
  
  .form-title {
    font-size: 24px;
  }
}
</style>
