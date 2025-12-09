<template>
  <div class="page-container">
    <div class="card">
      <div class="header">
        <div class="icon-container">
          <i class="fas fa-key"></i>
        </div>
        <h1 class="title">Forgotten your password?</h1>
        <p class="subtitle">Enter your e-mail address to obtain a new password.</p>
      </div>

      <!-- Alert for success or error messages -->
      <div v-if="message.text" :class="['alert', message.type === 'success' ? 'alert-success' : 'alert-error']">
        <i :class="message.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        <p>{{ message.text }}</p>
      </div>

      <form @submit.prevent="sendResetEmail">
        <div class="form-group">
          <label for="email"><i class="fas fa-envelope"></i> Email Address</label>
          <div class="input-with-icon">
            <i class="fas fa-envelope"></i>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="you@example.com"
              class="form-control"
              required
            />
          </div>
        </div>




       <div class="text-center">
  <button
    type="submit"
    class="btn btn-primary w-full py-3 mb-3"
    :disabled="loading"
  >
    <span v-if="loading">
      <i class="fas fa-circle-notch fa-spin mr-2"></i>
      Sending...
    </span>
    <span v-else>
      <i class="fas fa-paper-plane mr-2"></i>
      Send Reset Email
    </span>
  </button>
  
  <br/>

    <button
      type="button"
      class="btn btn-back btn-secondary w-full py-3"
      @click="$router.push('/login')">
    
      ← Back to login page

    </button>    
  

</div>

        
      </form>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

import { ref } from 'vue';
import { resetpassword } from "../services/api";

const router = useRouter();
const email = ref('');
const errors = ref({});

const loading = ref(false);
const message = ref({ text: '', type: '' });

const sendResetEmail = async () => {
  // Clear any previous messages
  message.value = { text: '', type: '' };
  loading.value = true;

  try {
     const res = await resetpassword({
    email: email.value,
  })



    email.value='';
    router.push("/password-reset-done")
    }
    catch (error) {
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

<style scoped>
/* GENERAL STYLES */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.page-container {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #e1e2e6 0%, #dad7de 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.btn-back {
  background-color: #6c757d;   /* same as btn-secondary */
  color: #fff;
  padding: 0.75rem;
  width: 100%;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.btn-back:hover {
  background-color: #5a6268;  /* darker gray */
  color: #e2e6ea;             /* lighter text */
}

.btn-back:active {
  background-color: #545b62;  /* even darker when clicked */
  color: #dee2e6;
}

 
.card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  padding: 40px;
  position: relative;
}
 
.card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  z-index: 0;
}
 
.header {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}
 
.icon-container {
  width: 70px;
  height: 70px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}
 
.icon-container i {
  color: white;
  font-size: 24px;
}
 
.title {
  font-weight: 700;
  color: #1f2937;
  font-size: 24px;
  margin-bottom: 8px;
}
 
.subtitle {
  color: #6b7280;
  font-size: 15px;
  line-height: 1.5;
}
 
.alert {
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}
 
.alert-success {
  background-color: #f0fff4;
  color: #2f855a;
  border-left: 4px solid #38a169;
}
 
.alert-error {
  background-color: #fff5f5;
  color: #c53030;
  border-left: 4px solid #e53e3e;
}
 
.alert i {
  margin-right: 10px;
  font-size: 18px;
}
 
.form-group {
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}
 
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
  font-size: 14px;
  display: flex;
  align-items: center;
}
 
.form-group label i {
  margin-right: 8px;
  color: #6366f1;
  font-size: 14px;
}
 
.input-with-icon {
  position: relative;
}
 
.input-with-icon i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 16px;
}
 
.form-control {
  width: 100%;
  padding: 14px 15px 14px 45px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #f8fafc;
  color: #4a5568;
}
 
.form-control:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  background: white;
}
 
.btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
}
 
.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
 
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(99, 102, 241, 0.4);
}
 
.btn-primary:active {
  transform: translateY(0);
}
 
.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
 
.btn i {
  margin-right: 8px;
}
 
.spinner {
  animation: spin 1s linear infinite;
}
 
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
 
@media (max-width: 480px) {
  .card {
    padding: 32px 24px;
  }
  
  .title {
    font-size: 22px;
  }
  
  .subtitle {
    font-size: 14px;
  }

  

}
</style>
