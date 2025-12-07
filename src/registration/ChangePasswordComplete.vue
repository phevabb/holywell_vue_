<!-- PasswordChangeComplete.vue -->
<template>
  <div class="container">
    <div class="card">
      <!-- Checkmark Icon -->
      <div class="icon-circle">
        <svg class="checkmark" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <!-- Content -->
      <h1 class="title">Password Changed!</h1>
      <p class="message">
        Your password has been updated successfully.<br />
        You can now sign in with your new password.
      </p>

      <!-- Button -->
      <router-link to="/login" class="btn">
        Continue to Login
      </router-link>
    </div>
  </div>
</template>

<script setup>
// No script needed — fully presentational
</script>

<style scoped>
/* Full-screen centered layout */
.container {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* Card */
.card {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 420px;
  width: 100%;
}

/* Checkmark Circle */
.icon-circle {
  width: 80px;
  height: 80px;
  background-color: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
}

.checkmark {
  width: 36px;
  height: 36px;
  stroke: #10b981;
  fill: none;
  stroke: currentColor;
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Typography */
.title {
  font-size: 28px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.message {
  font-size: 16px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

/* Button */
.btn {
  display: inline-block;
  width: 100%;
  background-color: #10b981;
  color: white;
  font-weight: 600;
  font-size: 16px;
  padding: 14px;
  border-radius: 12px;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.btn:hover {
  background-color: #059669;
}

.btn:active {
  background-color: #047857;
}

/* Responsive */
@media (max-width: 480px) {
  .card {
    padding: 2.5rem 1.5rem;
    margin: 1rem;
  }
  .title {
    font-size: 24px;
  }
}
</style>