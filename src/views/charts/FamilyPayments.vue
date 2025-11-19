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
                  {{ row.family_fee_record?.family?.name }} - {{ row.family_fee_record?.term?.name }} - {{ row.family_fee_record?.academic_year?.name }}
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
<CModal :visible="showDeleteSingleModal" @close="closeDeleteSingleModal">
  <CModalHeader>
    <CModalTitle>Delete Fee Structure</CModalTitle>
  </CModalHeader>

  <CModalBody>
    Are you sure you want to delete
    <strong>
      {{ deleteTarget?.familyFeeRecord?.family?.name }}
      -
      {{ deleteTarget?.familyFeeRecord?.term?.name }}
      -
      {{ deleteTarget?.familyFeeRecord?.academicYear?.name }}
    </strong>
    payment?
  </CModalBody>

  <CModalFooter>
    <CButton color="secondary" variant="outline" @click="closeDeleteSingleModal" :disabled="isDeleting">
      Cancel
    </CButton>
    <CButton color="danger" @click="handleDeletePayment" :disabled="isDeleting">
      <CSpinner size="sm" v-if="isDeleting" class="me-2" />Delete
    </CButton>
  </CModalFooter>
</CModal>


  <!-- Modal -->
  <CModal :visible="showFormModal" @close="closeFormModal">
    <CModalHeader>
      <CModalTitle>{{ isEdit ? 'Edit Payment' : 'Add Payment' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="mb-3">
        <CFormLabel for="familyFeeRecord">Family Fee Record</CFormLabel>
        <CFormSelect v-model="form.familyFeeRecordId">
          <option disabled value="" selected>Select Family</option>
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




import {
  get_family_payments,
  create_family_payment,
  delete_family_payment,
  get_family_fee_rec
} from '@/services/api'

import { useToast } from 'vue-toastification'
const toast = useToast()


const isDeleting = ref(false)

const handleDeletePayment = async () => {
  if (!deleteTarget.value) return

  isDeleting.value = true
  try {
    await deletePayment(deleteTarget.value.id)  // API call & local update
    closeDeleteSingleModal()                     // close the modal
  } catch (err) {
    // error is already handled in deletePayment
  } finally {
    isDeleting.value = false
  }
}




// REAL Family Fee Records
const familyFeeRecords = ref([])

// Load Family Fee Records from API
const fetchFamilyFeeRecords = async () => {
  try {
    const res = await get_family_fee_rec()
    familyFeeRecords.value = res.data || []
  } catch (err) {
    toast.error('Failed to load family fee records.', { position: 'top-right' })
  }
}

// REAL Payments Store
const listPayments = async () => {
  try {
    const res = await get_family_payments()
    console.log("res of fam print payments", res)
    return res.data || []
  } catch (err) {
    toast.error('Failed to fetch payments.', { position: 'top-right' })
    return []
  }
}

const createPayment = async (data) => {
  try {
    const res = await create_family_payment(data)
    toast.success('Payment added.', { position: 'top-right' })
    return res.data
  } catch (err) {
    const backendMsg = err.response?.data?.message?.toLowerCase() || ''
    let msg = 'Failed to add payment.'

    if (backendMsg.includes('constraint') || backendMsg.includes('foreign')) {
      msg = 'Cannot add payment because it is linked to missing or invalid records.'
    }

    toast.error(msg, { position: 'top-right' })
    throw err
  }
}

const updatePayment = async (id, data) => {
  try {
    const res = await create_family_payment(id, data) // If you have PUT/PATCH, update here
    toast.success('Payment updated.', { position: 'top-right' })
    return res.data
  } catch (err) {
    const backendMsg = err.response?.data?.message?.toLowerCase() || ''
    let msg = 'Failed to update payment.'

    if (backendMsg.includes('constraint') || backendMsg.includes('foreign')) {
      msg = 'This payment is linked to another record and cannot be updated.'
    }

    toast.error(msg, { position: 'top-right' })
    throw err
  }
}

const deletePayment = async (id) => {
  console.log("the id is:", id)
  try {
    await delete_family_payment(id)
    // Remove from local payments array
    payments.value = payments.value.filter(p => p.id !== id)

    // Also remove from selectedIds if it was selected
    selectedIds.value = selectedIds.value.filter(sid => sid !== id)

    toast.success('Payment deleted.', { position: 'top-right' })
    return true
  } catch (err) {
    const backendMsg = err.response?.data?.message?.toLowerCase() || ''
    let msg = 'Failed to delete payment.'

    if (backendMsg.includes('constraint') || backendMsg.includes('foreign')) {
      msg = 'This payment cannot be deleted because it is linked to other records.'
    }

    toast.error(msg, { position: 'top-right' })
    throw err
  }
}


const bulkDeletePayments = async (ids) => {
  try {
    await Promise.all(ids.map(id => delete_family_payment(id)))
    toast.success('Selected payments deleted.', { position: 'top-right' })
    return true
  } catch (err) {
    const backendMsg = err.response?.data?.message?.toLowerCase() || ''
    let msg = 'Failed to delete some selected payments.'

    if (backendMsg.includes('constraint') || backendMsg.includes('foreign')) {
      msg = 'Some payments are linked to other records and cannot be deleted.'
    }

    toast.error(msg, { position: 'top-right' })
    throw err
  }
}

const deleteTarget = ref(null)


function closeDeleteSingleModal() {
  showDeleteSingleModal.value = false
  deleteTarget.value = null
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

onMounted(async () => {
  await fetchFamilyFeeRecords()
  await fetchPayments()
})


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

const showDeleteSingleModal = ref(false)

const openSingleDeleteConfirm = async (payment) => {
  deleteTarget.value = payment
  showDeleteSingleModal.value = true

}


const openBulkDeleteConfirm = async () => {
  await bulkDeletePayments(selectedIds.value)
selectedIds.value = []
await fetchPayments()

}
</script>

<style scoped>
/* Ensure header actions wrap well on smaller screens */
@media (max-width: 576px) {
  .gap-2 { row-gap: 0.5rem; }
}
</style>