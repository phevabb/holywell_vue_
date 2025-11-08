<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong>Family Payments</strong>

            <div class="d-flex align-items-center gap-2 flex-wrap">
              <CFormInput
                v-model="searchTerm"
                placeholder="Search Family Fee Record..."
                aria-label="Search Family Fee Record"
                size="sm"
                style="min-width: 260px;"
              />

              <CButton
                color="danger"
                size="sm"
                :disabled="selectedIds.length === 0"
                @click="openBulkDeleteConfirm"
              >
                Delete Selected ({{ selectedIds.length }})
              </CButton>

              <CButton color="primary" size="sm" @click="openAddModal">
                Add Payment
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody>
          <CAlert color="danger" v-if="errorMessage" class="py-2">
            {{ errorMessage }}
          </CAlert>

          <div class="d-flex align-items-center gap-2 mb-2" v-if="isLoading">
            <CSpinner size="sm" />
            <span class="text-body-secondary small">Loading payments…</span>
          </div>

          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell class="text-center" style="width: 48px;">
                  <CFormCheck
                    :checked="allSelected"
                    :indeterminate="someSelected"
                    @change="toggleSelectAll"
                  />
                </CTableHeaderCell>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Family Fee Record</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell class="text-end">Amount (GHS)</CTableHeaderCell>
                <CTableHeaderCell class="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              <CTableRow v-for="(row, idx) in filteredPayments" :key="row.id">
                <CTableDataCell class="text-center">
                  <CFormCheck v-model="selectedIds" :value="row.id" />
                </CTableDataCell>
                <CTableHeaderCell>{{ idx + 1 }}</CTableHeaderCell>
                <CTableDataCell>
                  {{ row.familyFeeRecord?.family?.name }} - {{ row.familyFeeRecord?.term?.name }} - {{ row.familyFeeRecord?.academicYear?.name }}
                </CTableDataCell>
                <CTableDataCell>{{ row.date }}</CTableDataCell>
                <CTableDataCell class="text-end">{{ formatAmount(row.amount) }}</CTableDataCell>
                <CTableDataCell class="text-end">
                  <CButtonGroup size="sm">
                    <CButton color="secondary" variant="outline" @click="openEditModal(row)">Edit</CButton>
                    <CButton color="danger" variant="outline" @click="openSingleDeleteConfirm(row)">Delete</CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>

              <CTableRow v-if="!isLoading && filteredPayments.length === 0">
                <CTableDataCell colspan="6" class="text-center text-body-secondary">
                  No payments found<span v-if="searchTerm"> for “{{ searchTerm }}”.</span>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Modal -->
  <CModal :visible="showFormModal" @close="closeFormModal">
    <CModalHeader>
      <CModalTitle>{{ isEdit ? 'Edit Payment' : 'Add Payment' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="mb-3">
        <CFormLabel for="familyFeeRecord">Family Fee Record</CFormLabel>
        <CFormSelect v-model="form.familyFeeRecordId">
          <option disabled value="">Select Family</option>
          <option v-for="record in familyFeeRecords" :key="record.id" :value="record.id">
            {{ record.family.name }} - {{ record.term.name }} - {{ record.academicYear.name }}
          </option>
        </CFormSelect>
      </div>
      <div class="mb-3">
        <CFormLabel for="amount">Amount</CFormLabel>
        <CFormInput v-model="form.amount" type="number" step="0.01" />
      </div>
      <div class="mb-3">
        <CFormLabel for="date">Date</CFormLabel>
        <CFormInput v-model="form.date" type="date" />
      </div>
      <CButton color="primary" @click="submitForm">
        {{ isEdit ? 'Update' : 'Create' }}
      </CButton>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  CFormCheck, CFormInput, CButton, CButtonGroup, CModal, CModalHeader, CModalTitle, CModalBody,
  CAlert, CSpinner, CFormLabel, CFormSelect, CRow, CCol, CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell
} from '@coreui/vue'

// Simulated FamilyFeeRecords
const familyFeeRecords = ref([
  {
    id: 101,
    family: { name: 'Aidoo Family' },
    term: { name: 'Term 1' },
    academicYear: { name: '2025/2026' },
  },
  {
    id: 102,
    family: { name: 'Mensah Family' },
    term: { name: 'Term 2' },
    academicYear: { name: '2025/2026' },
  },
])

// Simulated Payments Store
let paymentsStore = []
let nextId = 1

const listPayments = async () => new Promise(resolve => setTimeout(() => resolve([...paymentsStore]), 300))
const createPayment = async (data) => {
  const record = familyFeeRecords.value.find(r => r.id === data.familyFeeRecordId)
  const newPayment = {
    id: nextId++,
    ...data,
    familyFeeRecord: record,
  }
  paymentsStore.push(newPayment)
  return new Promise(resolve => setTimeout(() => resolve(newPayment), 300))
}
const updatePayment = async (id, data) => {
  const index = paymentsStore.findIndex(p => p.id === id)
  const record = familyFeeRecords.value.find(r => r.id === data.familyFeeRecordId)
  if (index !== -1) {
    paymentsStore[index] = {
      ...paymentsStore[index],
      ...data,
      familyFeeRecord: record,
    }
  }
  return new Promise(resolve => setTimeout(() => resolve(paymentsStore[index]), 300))
}
const deletePayment = async (id) => {
  paymentsStore = paymentsStore.filter(p => p.id !== id)
  return new Promise(resolve => setTimeout(() => resolve(true), 300))
}
const bulkDeletePayments = async (ids) => {
  paymentsStore = paymentsStore.filter(p => !ids.includes(p.id))
  return new Promise(resolve => setTimeout(() => resolve(true), 300))
}

// Component State
const payments = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchTerm = ref('')
const selectedIds = ref([])
const showFormModal = ref(false)
const isEdit = ref(false)
const currentPayment = ref(null)

const form = ref({
  amount: '',
  date: '',
  familyFeeRecordId: '',
})

const fetchPayments = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    payments.value = await listPayments()
  } catch (err) {
    errorMessage.value = 'Failed to load payments.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPayments)

const filteredPayments = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return payments.value
  return payments.value.filter(p => {
    const family = p.familyFeeRecord?.family?.name?.toLowerCase() || ''
    const termName = p.familyFeeRecord?.term?.name?.toLowerCase() || ''
    const ay = p.familyFeeRecord?.academicYear?.name?.toLowerCase() || ''
    return family.includes(term) || termName.includes(term) || ay.includes(term)
  })
})

const allSelected = computed(() => selectedIds.value.length === filteredPayments.value.length && filteredPayments.value.length > 0)
const someSelected = computed(() => selectedIds.value.length > 0 && selectedIds.value.length < filteredPayments.value.length)

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredPayments.value.map(p => p.id)
  }
}

const formatAmount = (amount) => parseFloat(amount).toFixed(2)

const openAddModal = () => {
  isEdit.value = false
  currentPayment.value = null
  form.value = { amount: '', date: '', familyFeeRecordId: '' }
  showFormModal.value = true
}

const openEditModal = (payment) => {
  isEdit.value = true
  currentPayment.value = payment
  form.value = {
    amount: payment.amount,
    date: payment.date,
    familyFeeRecordId: payment.familyFeeRecord?.id || '',
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  currentPayment.value = null
}

const submitForm = async () => {
  try {
    if (isEdit.value && currentPayment.value) {
      await updatePayment(currentPayment.value.id, form.value)
    } else {
      await createPayment(form.value)
    }
    await fetchPayments()
    closeFormModal()
  } catch (err) {
    errorMessage.value = 'Failed to save payment.'
  }
}

const openSingleDeleteConfirm = async (payment) => {
  if (confirm(`Delete payment for ${payment.familyFeeRecord?.family?.name}?`)) {
    await deletePayment(payment.id)
    await fetchPayments()
  }
}

const openBulkDeleteConfirm = async () => {
  if (confirm(`Delete ${selectedIds.value.length} selected payments?`)) {
    await bulkDeletePayments(selectedIds.value)
    selectedIds.value = []
    await fetchPayments()
  }
}
</script>

<style scoped>
/* Ensure header actions wrap well on smaller screens */
@media (max-width: 576px) {
  .gap-2 { row-gap: 0.5rem; }
}
</style>