<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong>Payments</strong>

            <!-- Actions: Search (field + input) + Delete Selected + Add -->
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <!-- Search field dropdown -->
              <CFormSelect
                v-model="searchField"
                size="sm"
                style="min-width: 180px;"
                aria-label="Choose search field"
              >
                <option value="student">Search by Student</option>
                <option value="class">Search by Class</option>
                <option value="term">Search by Term</option>
                <option value="academicYear">Search by Academic Year</option>
              </CFormSelect>

              <!-- Search input -->
              <CFormInput
                v-model="searchTerm"
                :placeholder="searchPlaceholder"
                :aria-label="searchPlaceholder"
                size="sm"
                style="min-width: 220px;"
              />

              <!-- Bulk delete -->
              <CButton
                color="danger"
                size="sm"
                :disabled="selectedIds.length === 0"
                @click="openBulkDeleteConfirm"
              >
                Delete Selected ({{ selectedIds.length }})
              </CButton>

              <!-- Add Payment -->
              <CButton color="primary" size="sm" @click="openAddModal">
                Add Payment
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody>
          <p class="text-body-secondary small">Record and manage payments.</p>

          <!-- Error -->
          <CAlert color="danger" v-if="errorMessage" class="py-2">
            {{ errorMessage }}
          </CAlert>

          <!-- Loading -->
          <div class="d-flex align-items-center gap-2 mb-2" v-if="isLoading">
            <CSpinner size="sm" />
            <span class="text-body-secondary small">Loading payments…</span>
          </div>

          <!-- TABLE -->
          <!-- Remove <DocsExample> if you don't have this wrapper -->
          <DocsExample>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <!-- Select-all (applies to filtered rows) -->
                  <CTableHeaderCell scope="col" class="text-center" style="width: 48px;">
                    <CFormCheck
                      :checked="allSelected"
                      :indeterminate="someSelected"
                      @change="toggleSelectAll"
                      aria-label="Select all in current view"
                    />
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style="width: 60px;">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Student</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Term</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Academic Year</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Date</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-end">Amount (GHS)</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-end" style="width: 160px;">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <CTableRow v-for="(row, idx) in filteredPayments" :key="row.id">
                  <CTableDataCell class="text-center">
                    <CFormCheck v-model="selectedIds" :value="row.id" aria-label="Select row" />
                  </CTableDataCell>

                  <CTableHeaderCell scope="row">{{ idx + 1 }}</CTableHeaderCell>
                  <CTableDataCell>{{ row.studentFeeRecord?.student?.fullName }}</CTableDataCell>
                  <CTableDataCell>{{ row.studentFeeRecord?.feeStructure?.gradeClass?.name }}</CTableDataCell>
                  <CTableDataCell>{{ row.studentFeeRecord?.feeStructure?.term?.name }}</CTableDataCell>
                  <CTableDataCell>{{ row.studentFeeRecord?.feeStructure?.academicYear?.name }}</CTableDataCell>
                  <CTableDataCell>{{ row.date }}</CTableDataCell>
                  <CTableDataCell class="text-end">
                    {{ formatAmount(row.amount) }}
                  </CTableDataCell>

                  <CTableDataCell class="text-end">
                    <CButtonGroup size="sm">

                      <CButton color="danger" variant="outline" @click="openSingleDeleteConfirm(row)">
                        Delete
                      </CButton>
                    </CButtonGroup>
                  </CTableDataCell>
                </CTableRow>

                <!-- Empty -->
                <CTableRow v-if="!isLoading && filteredPayments.length === 0">
                  <CTableDataCell colspan="8" class="text-center text-body-secondary">
                    No payments found
                    <span v-if="searchTerm">
                      for “{{ searchTerm }}” in
                      {{
                        searchField === 'academicYear'
                          ? 'Academic Year'
                          : (searchField === 'term' ? 'Term' : (searchField === 'class' ? 'Class' : 'Student'))
                      }}.
                    </span>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </DocsExample>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Add/Edit Payment Modal -->
  <CModal :visible="showFormModal" @close="closeFormModal">
    <CModalHeader>
      <CModalTitle>{{ isEdit ? 'Edit Payment' : 'Add Payment' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="mb-3">
        <CFormLabel for="sfr">Student / Class / Term / AY</CFormLabel>
        <CFormSelect id="sfr" v-model="formPayment.studentFeeRecordId">
          <option value="" disabled selected>Select Student Fee Record</option>
          <option
            v-for="sfr in studentFeeRecords"
            :key="sfr.id"
            :value="sfr.id"
          >
            {{ sfr.student?.fullName }} — {{ sfr.feeStructure?.gradeClass?.name }}
            / {{ sfr.feeStructure?.term?.name }} / {{ sfr.feeStructure?.academicYear?.name }}
          </option>
        </CFormSelect>
      </div>

      <div class="mb-3">
        <CFormLabel for="date">Date</CFormLabel>
        <CFormInput id="date" v-model="formPayment.date" type="date" />
        <div class="text-body-secondary small mt-1" v-if="!formPayment.date">Defaults to today if left blank.</div>
      </div>

      <div class="mb-0">
        <CFormLabel for="amount">Amount (GHS)</CFormLabel>
        <CFormInput
          id="amount"
          v-model="formPayment.amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="e.g., 150.00"
        />
      </div>

      <div class="text-danger small mt-2" v-if="formValidationMessage">
        {{ formValidationMessage }}
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="closeFormModal" :disabled="isSubmitting">Cancel</CButton>
      <CButton color="primary" @click="submitForm" :disabled="isSubmitting">
        <CSpinner size="sm" v-if="isSubmitting" class="me-2" />
        {{ isEdit ? 'Update' : 'Save' }}
      </CButton>
    </CModalFooter>
  </CModal>

  <!-- Confirm Delete (Single) -->
  <CModal :visible="showDeleteSingleModal" @close="closeDeleteSingleModal">
    <CModalHeader><CModalTitle>Delete Payment</CModalTitle></CModalHeader>
    <CModalBody>
      Are you sure you want to delete the payment of
      <strong>GHS {{ formatAmount(deleteTarget?.amount) }}</strong>
      for
      <strong>{{ deleteTarget?.studentFeeRecord?.student?.fullName }}</strong>
      on {{ deleteTarget?.date }}?
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="closeDeleteSingleModal" :disabled="isDeleting">
        Cancel
      </CButton>
      <CButton color="danger" @click="confirmDeleteSingle" :disabled="isDeleting">
        <CSpinner size="sm" v-if="isDeleting" class="me-2" />Delete
      </CButton>
    </CModalFooter>
  </CModal>

  <!-- Confirm Delete (Bulk) -->
  <CModal :visible="showDeleteBulkModal" @close="closeBulkDeleteConfirm">
    <CModalHeader><CModalTitle>Delete Selected</CModalTitle></CModalHeader>
    <CModalBody>
      You are about to delete <strong>{{ selectedIds.length }}</strong> payment(s).
      This action cannot be undone. Continue?
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="closeBulkDeleteConfirm" :disabled="isDeleting">Cancel</CButton>
      <CButton color="danger" @click="confirmDeleteBulk" :disabled="isDeleting">
        <CSpinner size="sm" v-if="isDeleting" class="me-2" />Delete Selected
      </CButton>
    </CModalFooter>
  </CModal>

  <!-- Optional: Success toasts -->
  <CToaster placement="top-end">
    <CToast v-for="t in toasts" :key="t.id" :visible="t.visible" :color="t.color" class="text-white mb-2">
      <CToastBody>{{ t.message }}</CToastBody>
    </CToast>
  </CToaster>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { get_payments, get_student_fee_record, create_payment, delete_payment } from '../../services/api'

import { useToast } from 'vue-toastification'
const toast = useToast()
/**
 * Simulated API aligned with Payment:
 * Payment { id, studentFeeRecord, date: 'YYYY-MM-DD', amount }
 * StudentFeeRecord contains: { id, student: { id, fullName }, feeStructure: { academicYear, gradeClass, term } }
 */
const paymentApi = (() => {
  // Utility
  const today = () => new Date().toISOString().slice(0, 10)

  return {
    async listPayments() {
      try {
        const response = await get_payments()
        // Expecting backend to return: [{ id, studentFeeRecord, date, amount }, ...]
        return response.data || []
      } catch (error) {
        console.error('Error fetching payments:', error)
        throw error
      }
    },

    async listStudentFeeRecords() {
      
      try {
        const response = await get_student_fee_record() 
        console.log("fee recs:.......", response.data);
        return response.data?.map(p => p.studentFeeRecord) || []
      } catch (error) {
        console.error('Error fetching student fee records:', error)
        throw error
      }
    },

    async createPayment(payload) {
      try {
        // payload: { studentFeeRecordId, date?, amount }
        const response = await create_payment(payload)

        return response.data.all || response

      } catch (error) {
        console.error('Error creating payment:', error)
        throw error
      }
    },


    async deletePayment(id) {
      try {
        const response = await delete_payment(id)
        
        toast.success('Payment deleted successfully.')
        return response.data || response
      } catch (error) {
        console.error('Error deleting payment:', error)
        throw error
      }
    },

    async deletePayments(ids) {
      try {
        const results = await Promise.all(ids.map(id => delete_payment(id)))
        return { success: true, deleted: results.length }
      } catch (error) {
        console.error('Error deleting multiple payments:', error)
        throw error
      }
    },
  }
})()


/* ---------- State ---------- */
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const errorMessage = ref('')

const payments = ref([])
const studentFeeRecords = ref([])

/* Search controls */
const searchField = ref('student') // 'student' | 'class' | 'term' | 'academicYear'
const searchTerm = ref('')

/* Selection */
const selectedIds = ref([])

/* Form (Add/Edit) */
const showFormModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formPayment = reactive({
  studentFeeRecordId: '',
  date: '',
  amount: '',
})
const formValidationMessage = ref('')

/* Delete confirmations */
const showDeleteSingleModal = ref(false)
const deleteTarget = ref(null)
const showDeleteBulkModal = ref(false)


/* ---------- Computed ---------- */
const searchPlaceholder = computed(() => {
  switch (searchField.value) {
    case 'academicYear': return 'Search academic year...'
    case 'term': return 'Search term...'
    case 'class': return 'Search class...'
    default: return 'Search student...'
  }
})

const filteredPayments = computed(() => {
  const q = searchTerm.value.trim().toLowerCase()
  if (!q) return payments.value

  return payments.value.filter((row) => {
    const fs = row?.studentFeeRecord?.feeStructure
    const student = row?.studentFeeRecord?.student
    switch (searchField.value) {
      case 'academicYear':
        return String(fs?.academicYear?.name || '').toLowerCase().includes(q)
      case 'term':
        return String(fs?.term?.name || '').toLowerCase().includes(q)
      case 'class':
        return String(fs?.gradeClass?.name || '').toLowerCase().includes(q)
      default: // student
        return String(student?.fullName || '').toLowerCase().includes(q)
    }
  })
})

const filteredIds = computed(() => filteredPayments.value.map(r => r.id))
const allSelected = computed(() =>
  filteredIds.value.length > 0 && filteredIds.value.every(id => selectedIds.value.includes(id)),
)
const someSelected = computed(() =>
  filteredIds.value.length > 0 &&
  !allSelected.value &&
  filteredIds.value.some(id => selectedIds.value.includes(id)),
)

/* ---------- Helpers ---------- */
function formatAmount(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return v
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function resetForm() {
  formPayment.studentFeeRecordId = ''
  formPayment.date = ''
  formPayment.amount = ''
  formValidationMessage.value = ''
  editingId.value = null
}
function validateForm() {
  if (!formPayment.studentFeeRecordId) {
    formValidationMessage.value = 'Student Fee Record is required.'
    return false
  }
  if (formPayment.amount === '' || Number(formPayment.amount) < 0) {
    formValidationMessage.value = 'Amount must be a non-negative number.'
    return false
  }
  formValidationMessage.value = ''
  return true
}

/* ---------- Select All (current filtered view) ---------- */
function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = selectedIds.value.filter(id => !filteredIds.value.includes(id))
  } else {
    const set = new Set(selectedIds.value)
    filteredIds.value.forEach(id => set.add(id))
    selectedIds.value = Array.from(set)
  }
}

/* ---------- Loaders ---------- */
function loadStudentFeeRecords() {
  return paymentApi.listStudentFeeRecords().then(x => (studentFeeRecords.value = x))
}
function loadPayments() {
  isLoading.value = true
  errorMessage.value = ''
  return paymentApi
    .listPayments()
    .then(rows => (payments.value = rows))
    .catch(err => (errorMessage.value = err?.message || 'Failed to load payments.'))
    .finally(() => (isLoading.value = false))
}

/* ---------- Modal handlers ---------- */
function openAddModal() {
  isEdit.value = false
  resetForm()
  showFormModal.value = true
}
function openEditModal(row) {
  isEdit.value = true
  editingId.value = row.id
  formPayment.studentFeeRecordId = row?.studentFeeRecord?.id ?? ''
  formPayment.date = row?.date ?? ''
  formPayment.amount = row?.amount ?? ''
  formValidationMessage.value = ''
  showFormModal.value = true
}
function closeFormModal() {
  if (!isSubmitting.value) {
    showFormModal.value = false
    resetForm()
  }
}

/* ---------- Delete modals ---------- */
function openSingleDeleteConfirm(row) {
  deleteTarget.value = row
  console.log("item to delete....:", row)

  showDeleteSingleModal.value = true
}
function closeDeleteSingleModal() {
  if (!isDeleting.value) {
    showDeleteSingleModal.value = false
    deleteTarget.value = null
  }
}
function openBulkDeleteConfirm() {
  showDeleteBulkModal.value = true
}
function closeBulkDeleteConfirm() {
  if (!isDeleting.value) {
    showDeleteBulkModal.value = false
  }
}

/* ---------- Submit (Create/Update) ---------- */
function submitForm() {
  if (!validateForm()) return
  isSubmitting.value = true

  const payload = {
    studentFeeRecordId: formPayment.studentFeeRecordId,
    date: formPayment.date || undefined, // backend @PrePersist will set today if null
    amount: formPayment.amount,
  }

  const done = () => (isSubmitting.value = false)

  if (isEdit.value && editingId.value != null) {
    paymentApi
      .updatePayment(editingId.value, payload)
      .then((updated) => {
        payments.value = payments.value.map(r => (r.id === updated.id ? updated : r))
        showFormModal.value = false
        resetForm()
        toast.success('Payment updated successfully.')

      })
      .catch((err) => (formValidationMessage.value = err?.message || 'Failed to update payment.'))
      .finally(done)
  } else {
    paymentApi
      .createPayment(payload)
      .then((created) => {
        payments.value = [...payments.value, created]
        showFormModal.value = false
        resetForm()
        toast.success('Payment added successfully.')

      })
      .catch((err) => (formValidationMessage.value = err?.message || 'Failed to add payment.'))
      .finally(done)
  }
}

/* ---------- Delete (Single/Bulk) ---------- */
function confirmDeleteSingle() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  paymentApi
    .deletePayment(deleteTarget.value.id)
    .then(() => {
      // update table
      payments.value = payments.value.filter(r => r.id !== deleteTarget.value.id)
      // remove from selection, if needed
      selectedIds.value = selectedIds.value.filter(id => id !== deleteTarget.value.id)

      // ✅ close modal immediately
      showDeleteSingleModal.value = false
      deleteTarget.value = null
      toasts.success('Payment deleted.  ')

    })
    .finally(() => (isDeleting.value = false))
}

function confirmDeleteBulk() {
  const ids = [...selectedIds.value]
  if (ids.length === 0) return
  isDeleting.value = true
  paymentApi
    .deletePayments(ids)
    .then(() => {
      const toDelete = new Set(ids)
      payments.value = payments.value.filter(r => !toDelete.has(r.id))

      // clear selection
      selectedIds.value = []

      // ✅ close modal immediately
      showDeleteBulkModal.value = false
      toast.success('Payments deleted successfully.')

      
    })
    .finally(() => (isDeleting.value = false))
}

/* ---------- Init ---------- */
onMounted(async () => {
  try {
    isLoading.value = true
    const a = await get_student_fee_record()
    console.log("tissss", a)

    studentFeeRecords.value = a.data

    await loadPayments()
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Ensure header actions wrap well on smaller screens */
@media (max-width: 576px) {
  .gap-2 {
    row-gap: 0.5rem;
  }
}
</style>