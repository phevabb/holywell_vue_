<script setup>
import { ref, computed } from "vue";
import { changepassword } from "@/services/api";
import { useRouter } from "vue-router";

const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const message = ref({ text: "", type: "" });
const errors = ref({});
const showPassword = ref({
  oldPassword: false,
  newPassword: false,
  confirmPassword: false,
});
const router = useRouter();
// Password strength calculation
const passwordStrength = computed(() => {
  if (!newPassword.value) return 0;
  let strength = 0;
  if (newPassword.value.length >= 8) strength += 25;
  if (newPassword.value.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 25;
  if (newPassword.value.match(/[0-9]/)) strength += 25;
  if (newPassword.value.match(/[!@#$%^&*?_~]/)) strength += 25;
  return strength;
});

const strengthColor = computed(() => {
  if (passwordStrength.value < 50) return "#e53e3e";
  if (passwordStrength.value < 75) return "#dd6b20";
  return "#38a169";
});

function togglePasswordVisibility(field) {
  showPassword.value[field] = !showPassword.value[field];
}

const handleChangePassword = async () => {
  loading.value = true;
  try {
    await changepassword({
      old_password: oldPassword.value,
      new_password: newPassword.value,
      confirm_password: confirmPassword.value,
    });

  
    oldPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";

    router.push("/change-password-complete");
  } catch (error) {
    if (error.response && error.response.data) {
      errors.value = error.response.data;
      message.value = {
        text: error.response.data.non_field_errors
          ? error.response.data.non_field_errors[0]
          : "Failed to change password. Please check the form for errors.",
        type: "error",
      };
    } else {
      message.value = {
        text: "Network error. Please try again later.",
        type: "error",
      };
    }
    
  } finally {
    loading.value = false;
  }
};

</script>

<template>
  <div class="password-container">
    <div class="form-wrapper">
      <!-- Header -->
      <div class="header">
        <div class="header-icon">
          <i class="fas fa-lock"></i>
        </div>
        <h2>Change Password</h2>
        <p>Secure your account with a new password</p>
      </div>

      <!-- Status Alert -->
      <transition name="fade">
        <div
          v-if="message.text"
          :class="['alert', message.type === 'success' ? 'alert-success' : 'alert-error']"
          role="alert"
        >
          <i :class="message.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
          <div>
            <p class="font-bold">{{ message.type === 'success' ? 'Success' : 'Error' }}</p>
            <p>{{ message.text }}</p>
          </div>
        </div>
      </transition>

      <!-- Password Form -->
      <form @submit.prevent="handleChangePassword">
        <!-- Old Password -->
        <div class="form-group">
          <label for="oldPassword"><i class="fas fa-key"></i> Old Password</label>
          <div class="input-with-icon">
            <i class="fas fa-lock"></i>
            <input
              :type="showPassword.oldPassword ? 'text' : 'password'"
              id="oldPassword"
              v-model="oldPassword"
              class="form-control"
              :class="{ error: errors.old_password }"
              required
            />
            <span class="password-toggle" @click="togglePasswordVisibility('oldPassword')">
              <i :class="showPassword.oldPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
          <p v-if="errors.old_password" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ errors.old_password }}
          </p>
        </div>

        <!-- New Password -->
        <div class="form-group">
          <label for="newPassword"><i class="fas fa-key"></i> New Password</label>
          <div class="input-with-icon">
            <i class="fas fa-lock"></i>
            <input
              :type="showPassword.newPassword ? 'text' : 'password'"
              id="newPassword"
              v-model="newPassword"
              class="form-control"
              :class="{ error: errors.new_password }"
              required
            />
            <span class="password-toggle" @click="togglePasswordVisibility('newPassword')">
              <i :class="showPassword.newPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
          <!-- Strength Meter -->
          <div class="strength-meter">
            <div
              class="strength-fill"
              :style="{ width: passwordStrength + '%', backgroundColor: strengthColor }"
            ></div>
          </div>
          <p v-if="errors.new_password" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ errors.new_password }}
          </p>
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label for="confirmPassword"><i class="fas fa-key"></i> Confirm New Password</label>
          <div class="input-with-icon">
            <i class="fas fa-lock"></i>
            <input
              :type="showPassword.confirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              class="form-control"
              :class="{ error: errors.confirm_password }"
              required
            />
            <span class="password-toggle" @click="togglePasswordVisibility('confirmPassword')">
              <i :class="showPassword.confirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
          <p v-if="errors.confirm_password" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ errors.confirm_password }}
          </p>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <i class="fas fa-sync-alt" v-if="loading"></i>
          <i class="fas fa-key" v-else></i>
          {{ loading ? 'Changing Password...' : 'Change Password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* GENERAL STYLES */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

body {
  font-family: 'Poppins', sans-serif;
  background-color: #f0f2f5;
  margin: 0;
  color: #333;
}

.password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
}

.form-wrapper {
  background-color: #ffffff;
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
}

/* HEADER STYLES */
.header {
  margin-bottom: 2rem;
}

.header-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(45deg, #6a85b6, #bac8e0);
  color: #fff;
  font-size: 2rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 15px rgba(106, 133, 182, 0.4);
}

.header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #333;
}

.header p {
  font-size: 0.9rem;
  color: #777;
}

/* FORM STYLES */
.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group label i {
  margin-right: 0.5rem;
  color: #6a85b6;
}

.input-with-icon {
  position: relative;
}

.input-with-icon .fas {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem; /* Add padding for the icon */
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.form-control:focus {
  outline: none;
  border-color: #6a85b6;
  box-shadow: 0 0 0 3px rgba(106, 133, 182, 0.3);
}

.form-control.error {
  border-color: #e53e3e;
}

.error-message {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

.error-message i {
  margin-right: 0.3rem;
}

/* Password Toggle */
.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #aaa;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #6a85b6;
}

/* Password Strength Meter */
.strength-meter {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease-in-out, background-color 0.3s ease;
  border-radius: 4px;
}

/* ALERT STYLES */
.alert {
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  font-size: 0.9rem;
}

.alert i {
  font-size: 1.5rem;
}

.alert-success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.alert-error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

/* BUTTON STYLES */
.btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(45deg, #6a85b6, #bac8e0);
  color: #fff;
  box-shadow: 0 4px 15px rgba(106, 133, 182, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(106, 133, 182, 0.5);
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn .fas {
  animation: spin 1s linear infinite;
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* KEYFRAMES */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
