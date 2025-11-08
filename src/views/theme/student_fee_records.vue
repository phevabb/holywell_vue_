<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-2">
          <div>
            <h5 class="mb-0">Student Fee Records</h5>
            <small class="text-body-secondary">Manage student fee payment records</small>
          </div>

          <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
            <!-- Search Field Selector -->
            <CFormSelect v-model="searchField" size="sm" style="width: 180px;">
              <option value="class">Search by Current Class</option>
              <option value="feeStructure">Search by Fee Structure</option>
              <option value="fullyPaid">Filter by Is Fully Paid</option>
            </CFormSelect>

            <!-- Search Input / Fully Paid Filter -->
            <div v-if="searchField !== 'fullyPaid'">
              <CFormInput
                v-model="searchTerm"
                :placeholder="searchPlaceholder"
                size="sm"
                style="width: 250px;"
              />
            </div>
            <div v-else>
              <CFormSelect v-model="fullyPaidFilter" size="sm" style="width: 150px;">
                <option value="all">All</option>
                <option value="true">Fully Paid: Yes</option>
                <option value="false">Fully Paid: No</option>
              </CFormSelect>
            </div>

            <!-- Actions -->
            <CButton color="primary" size="sm" @click="openAddModal">
              Add Record
            </CButton>
            <CButton
              color="danger"
              size="sm"
              :disabled="selectedIds.length === 0"
              @click="openBulkDeleteConfirm"
            >
              Delete Selected ({{ selectedIds.length }})
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          <p class="text-body-secondary small">Track fees paid, balances, and payment status per student and fee structure.</p>

          <!-- Error -->
          <CAlert color="danger" v-if="errorMessage" class="py-2">
            {{ errorMessage }}
          </CAlert>

          <!-- Loading -->
          <div class="d-flex align-items-center gap-2 mb-2" v-if="isLoading">
            <CSpinner size="sm" />
            <span class="text-body-secondary small">Loading fee records…</span>
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
                  <CTableHeaderCell scope="col" class="text-end">Amount Paid (GHS)</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-end">Balance (GHS)</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Fully Paid</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-end" style="width: 160px;">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <CTableRow v-for="(row, idx) in filteredRecords" :key="row.id">
                  <CTableDataCell class="text-center">
                    <CFormCheck v-model="selectedIds" :value="row.id" aria-label="Select row" />
                  </CTableDataCell>

                  <CTableHeaderCell scope="row">{{ idx + 1 }}</CTableHeaderCell>
                  <CTableDataCell>{{ row.student?.fullName }}</CTableDataCell>
                  <CTableDataCell>{{ row.feeStructure?.gradeClass?.name }}</CTableDataCell>
                  <CTableDataCell>{{ row.feeStructure?.term?.name }}</CTableDataCell>
                  <CTableDataCell>{{ row.feeStructure?.academicYear?.name }}</CTableDataCell>
                  <CTableDataCell class="text-end">{{ formatAmount(row.amountPaid) }}</CTableDataCell>
                  <CTableDataCell class="text-end">{{ formatAmount(row.balance) }}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge :color="row.isFullyPaid ? 'success' : 'warning'">
                      {{ row.isFullyPaid ? 'Yes' : 'No' }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{{ formatDateTime(row.dateCreated) }}</CTableDataCell>

                  <CTableDataCell class="text-end">
                    <CButtonGroup size="sm">
                      <CButton color="secondary" variant="outline" @click="openEditModal(row)">
                        Edit
                      </CButton>
                      <CButton color="danger" variant="outline" @click="openSingleDeleteConfirm(row)">
                        Delete
                      </CButton>
                    </CButtonGroup>
                  </CTableDataCell>
                </CTableRow>

                <!-- Empty -->
                <CTableRow v-if="!isLoading && filteredRecords.length === 0">
                  <CTableDataCell colspan="10" class="text-center text-body-secondary">
                    No fee records found
                    <span v-if="searchField === 'fullyPaid' && fullyPaidFilter !== 'all'">
                      for “{{ fullyPaidFilter === 'true' ? 'Yes' : 'No' }}” in Is Fully Paid.
                    </span>
                    <span v-else-if="searchTerm">
                      for “{{ searchTerm }}” in
                      {{ searchField === 'class' ? 'Current Class' : 'Fee Structure' }}.
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

  <!-- Add/Edit Record Modal -->
  <CModal :visible="showFormModal" @close="closeFormModal">
    <CModalHeader>
      <CModalTitle>{{ isEdit ? 'Edit Fee Record' : 'Add Fee Record' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="mb-3">
        <CFormLabel for="student">Student</CFormLabel>
        <CFormSelect id="student" v-model="formRecord.studentId">
          <option value="" disabled>Select Student</option>
          <option v-for="s in students" :key="s.id" :value="s.id">
            {{ s.fullName }}
          </option>
        </CFormSelect>
      </div>

      <div class="mb-3">
        <CFormLabel for="feeStructure">Fee Structure (Class / Term / AY)</CFormLabel>
        <CFormSelect id="feeStructure" v-model="formRecord.feeStructureId">
          <option value="" disabled>Select Fee Structure</option>
          <option v-for="fs in feeStructures" :key="fs.id" :value="fs.id">
            {{ fs.gradeClass?.name }} / {{ fs.term?.name }} / {{ fs.academicYear?.name }}
          </option>
        </CFormSelect>
      </div>

      <div class="mb-3">
        <CFormLabel for="amountPaid">Amount Paid (GHS)</CFormLabel>
        <CFormInput
          id="amountPaid"
          v-model="formRecord.amountPaid"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>

      <div class="mb-3">
        <CFormLabel for="balance">Balance (GHS)</CFormLabel>
        <CFormInput
          id="balance"
          v-model="formRecord.balance"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>

      <div class="mb-0">
        <CFormCheck
          id="fullyPaid"
          v-model="formRecord.isFullyPaid"
          :checked="formRecord.isFullyPaid"
          label="Is Fully Paid"
        />
      </div>

      <!-- Readonly dateCreated on edit -->
      <div class="mt-2 text-body-secondary small" v-if="isEdit && viewDateCreated">
        Created: {{ formatDateTime(viewDateCreated) }}
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
    <CModalHeader><CModalTitle>Delete Fee Record</CModalTitle></CModalHeader>
    <CModalBody>
      Delete the record for
      <strong>{{ deleteTarget?.student?.fullName }}</strong>,
      <strong>{{ deleteTarget?.feeStructure?.gradeClass?.name }}</strong> /
      <strong>{{ deleteTarget?.feeStructure?.term?.name }}</strong> /
      <strong>{{ deleteTarget?.feeStructure?.academicYear?.name }}</strong>?
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
      You are about to delete <strong>{{ selectedIds.length }}</strong> record(s).
      This action cannot be undone. Continue?
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="closeBulkDeleteConfirm" :disabled="isDeleting">
        Cancel
      </CButton>
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

/**
 * Simulated API aligned with StudentFeeRecord:
 * StudentFeeRecord {
 *   id,
 *   student: { id, fullName },
 *   feeStructure: { id, academicYear:{id,name}, gradeClass:{id,name}, term:{id,name} },
 *   amountPaid, balance, isFullyPaid, dateCreated: 'YYYY-MM-DDTHH:mm:ssZ'
 * }
 */
const sfrApi = (() => {
  // Lookups - Students
  const STUDENTS = [
    { id: 201, fullName: 'Ama Boateng' },
    { id: 202, fullName: 'Kojo Mensah' },
    { id: 203, fullName: 'Yaw Owusu' },
  ]

  // Lookups - FeeStructure parts
  const AY = [
    { id: 1, name: '2024/2025' },
    { id: 2, name: '2025/2026' },
  ]
  const GC = [
    { id: 11, name: 'Grade 1' },
    { id: 12, name: 'Grade 2' },
    { id: 13, name: 'JHS 1' },
  ]
  const TM = [
    { id: 100, name: 'Term 1' },
    { id: 101, name: 'Term 2' },
    { id: 102, name: 'Term 3' },
  ]

  // FeeStructures
  const FEE_STRUCTURES = [
    { id: 1, academicYear: AY[0], gradeClass: GC[0], term: TM[0] },
    { id: 2, academicYear: AY[0], gradeClass: GC[1], term: TM[1] },
    { id: 3, academicYear: AY[0], gradeClass: GC[2], term: TM[0] },
    { id: 4, academicYear: AY[1], gradeClass: GC[1], term: TM[0] },
  ]

  // Initial StudentFeeRecords
  let _idCounter = 3
  let _data = [
    {
      id: 1,
      student: STUDENTS[0],
      feeStructure: FEE_STRUCTURES[0],
      amountPaid: '150.00',
      balance: '100.00',
      isFullyPaid: false,
      dateCreated: new Date('2025-09-12T10:05:00Z').toISOString(),
    },
    {
      id: 2,
      student: STUDENTS[1],
      feeStructure: FEE_STRUCTURES[1],
      amountPaid: '300.00',
      balance: '0.00',
      isFullyPaid: true,
      dateCreated: new Date('2025-09-15T14:30:00Z').toISOString(),
    },
    {
      id: 3,
      student: STUDENTS[2],
      feeStructure: FEE_STRUCTURES[2],
      amountPaid: '80.00',
      balance: '240.00',
      isFullyPaid: false,
      dateCreated: new Date('2025-10-03T08:45:00Z').toISOString(),
    },
  ]

  const byId = (list, id) => list.find(x => String(x.id) === String(id)) || null
  const nowIso = () => new Date().toISOString()

  return {
    listSfr() {
      return new Promise((resolve) => setTimeout(() => resolve(JSON.parse(JSON.stringify(_data))), 450))
    },
    listStudents() {
      return new Promise((resolve) => setTimeout(() => resolve(JSON.parse(JSON.stringify(STUDENTS))), 250))
    },
    listFeeStructures() {
      return new Promise((resolve) => setTimeout(() => resolve(JSON.parse(JSON.stringify(FEE_STRUCTURES))), 250))
    },
    createSfr(payload /* { studentId, feeStructureId, amountPaid, balance, isFullyPaid } */) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const student = byId(STUDENTS, payload?.studentId)
          const feeStructure = byId(FEE_STRUCTURES, payload?.feeStructureId)
          const amountPaid = Number(payload?.amountPaid)
          const balance = Number(payload?.balance)
          const isFullyPaid = !!payload?.isFullyPaid

          if (!student) return reject(new Error('Student is required'))
          if (!feeStructure) return reject(new Error('Fee Structure is required'))
          if (!(amountPaid >= 0)) return reject(new Error('Amount Paid must be non-negative'))
          if (!(balance >= 0)) return reject(new Error('Balance must be non-negative'))

          _idCounter += 1
          const created = {
            id: _idCounter,
            student, feeStructure,
            amountPaid: amountPaid.toFixed(2),
            balance: balance.toFixed(2),
            isFullyPaid,
            dateCreated: nowIso(),
          }
          _data = [..._data, created]
          resolve(JSON.parse(JSON.stringify(created)))
        }, 450)
      })
    },
    updateSfr(id, payload /* same as create */) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const idx = _data.findIndex(r => String(r.id) === String(id))
          if (idx === -1) return reject(new Error('Record not found'))
          const student = byId(STUDENTS, payload?.studentId)
          const feeStructure = byId(FEE_STRUCTURES, payload?.feeStructureId)
          const amountPaid = Number(payload?.amountPaid)
          const balance = Number(payload?.balance)
          const isFullyPaid = !!payload?.isFullyPaid

          if (!student) return reject(new Error('Student is required'))
          if (!feeStructure) return reject(new Error('Fee Structure is required'))
          if (!(amountPaid >= 0)) return reject(new Error('Amount Paid must be non-negative'))
          if (!(balance >= 0)) return reject(new Error('Balance must be non-negative'))

          const updated = {
            id: _data[idx].id,
            student, feeStructure,
            amountPaid: amountPaid.toFixed(2),
            balance: balance.toFixed(2),
            isFullyPaid,
            dateCreated: _data[idx].dateCreated, // immutable
          }
          _data.splice(idx, 1, updated)
          resolve(JSON.parse(JSON.stringify(updated)))
        }, 450)
      })
    },
    deleteSfr(id) {
      return new Promise((resolve) => {
        setTimeout(() => {
          _data = _data.filter(r => String(r.id) !== String(id))
          resolve({ success: true })
        }, 350)
      })
    },
    deleteSfrBulk(ids /* number[] */) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const idSet = new Set(ids.map(String))
          _data = _data.filter(r => !idSet.has(String(r.id)))
          resolve({ success: true, deleted: ids.length })
        }, 500)
      })
    },
  }
})()

/* ---------- State ---------- */
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const errorMessage = ref('')

const records = ref([])
const students = ref([])
const feeStructures = ref([])

/* Search controls */
const searchField = ref('class') // 'class' | 'fullyPaid' | 'feeStructure'
const searchTerm = ref('')
const fullyPaidFilter = ref('all') // 'all' | 'true' | 'false'

/* Selection */
const selectedIds = ref([])

/* Form (Add/Edit) */
const showFormModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const viewDateCreated = ref('')
const formRecord = reactive({
  studentId: '',
  feeStructureId: '',
  amountPaid: '',
  balance: '',
  isFullyPaid: false,
})
const formValidationMessage = ref('')

/* Delete confirmations */
const showDeleteSingleModal = ref(false)
const deleteTarget = ref(null)
const showDeleteBulkModal = ref(false)

/* Toasts (optional) */
const toasts = ref([])
function addToast({ message, color = 'success', delay = 2200 }) {
  const id = Date.now() + Math.random()
  toasts.value.push({ id, message, color, visible: true })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, delay)
}

/* ---------- Computed ---------- */
const searchPlaceholder = computed(() => {
  switch (searchField.value) {
    case 'feeStructure': return 'Search fee structure (e.g., Grade 1/Term 1/2024/2025)...'
    default: return 'Search current class...'
  }
})

function feeStructureLabel(fs) {
  if (!fs) return ''
  return `${fs.gradeClass?.name || ''} / ${fs.term?.name || ''} / ${fs.academicYear?.name || ''}`
}

const filteredRecords = computed(() => {
  if (searchField.value === 'fullyPaid') {
    if (fullyPaidFilter.value === 'all') return records.value
    const flag = fullyPaidFilter.value === 'true'
    return records.value.filter(r => !!r.isFullyPaid === flag)
  }

  const q = searchTerm.value.trim().toLowerCase()
  if (!q) return records.value

  return records.value.filter((row) => {
    if (searchField.value === 'class') {
      return String(row?.feeStructure?.gradeClass?.name || '').toLowerCase().includes(q)
    }
    // feeStructure combined label
    return feeStructureLabel(row?.feeStructure).toLowerCase().includes(q)
  })
})

const filteredIds = computed(() => filteredRecords.value.map(r => r.id))
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
function formatDateTime(iso) {
  if (!iso) return ''
  // Simple local-friendly format YYYY-MM-DD HH:mm
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}
function resetForm() {
  formRecord.studentId = ''
  formRecord.feeStructureId = ''
  formRecord.amountPaid = ''
  formRecord.balance = ''
  formRecord.isFullyPaid = false
  viewDateCreated.value = ''
  formValidationMessage.value = ''
  editingId.value = null
}
function validateForm() {
  if (!formRecord.studentId) {
    formValidationMessage.value = 'Student is required.'
    return false
  }
  if (!formRecord.feeStructureId) {
    formValidationMessage.value = 'Fee Structure is required.'
    return false
  }
  if ( Number(formRecord.amountPaid) < 0) {
    formValidationMessage.value = 'Amount Paid must be a non-negative number.'
    return false
  }
  if (Number(formRecord.balance) < 0) {
    formValidationMessage.value = 'Balance must be a non-negative number.'
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
function loadLookups() {
  return Promise.all([
    sfrApi.listStudents().then(x => (students.value = x)),
    sfrApi.listFeeStructures().then(x => (feeStructures.value = x)),
  ])
}
function loadRecords() {
  isLoading.value = true
  errorMessage.value = ''
  return sfrApi
    .listSfr()
    .then(rows => (records.value = rows))
    .catch(err => (errorMessage.value = err?.message || 'Failed to load fee records.'))
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
  formRecord.studentId = row?.student?.id ?? ''
  formRecord.feeStructureId = row?.feeStructure?.id ?? ''
  formRecord.amountPaid = row?.amountPaid ?? ''
  formRecord.balance = row?.balance ?? ''
  formRecord.isFullyPaid = !!row?.isFullyPaid
  viewDateCreated.value = row?.dateCreated || ''
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
    studentId: formRecord.studentId,
    feeStructureId: formRecord.feeStructureId,
    amountPaid: formRecord.amountPaid,
    balance: formRecord.balance,
    isFullyPaid: !!formRecord.isFullyPaid,
  }

  const done = () => (isSubmitting.value = false)

  if (isEdit.value && editingId.value != null) {
    sfrApi
      .updateSfr(editingId.value, payload)
      .then((updated) => {
        records.value = records.value.map(r => (r.id === updated.id ? updated : r))
        showFormModal.value = false
        resetForm()
        addToast({ message: 'Record updated.' })
      })
      .catch((err) => (formValidationMessage.value = err?.message || 'Failed to update record.'))
      .finally(done)
  } else {
    sfrApi
      .createSfr(payload)
      .then((created) => {
        records.value = [...records.value, created]
        showFormModal.value = false
        resetForm()
        addToast({ message: 'Record added.' })
      })
      .catch((err) => (formValidationMessage.value = err?.message || 'Failed to add record.'))
      .finally(done)
  }
}

/* ---------- Delete (Single/Bulk) ---------- */
function confirmDeleteSingle() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  sfrApi
    .deleteSfr(deleteTarget.value.id)
    .then(() => {
      // update table
      records.value = records.value.filter(r => r.id !== deleteTarget.value.id)
      // remove from selection
      selectedIds.value = selectedIds.value.filter(id => id !== deleteTarget.value.id)

      // ✅ close modal immediately
      showDeleteSingleModal.value = false
      deleteTarget.value = null

      addToast({ message: 'Record deleted.' })
    })
    .finally(() => (isDeleting.value = false))
}

function confirmDeleteBulk() {
  const ids = [...selectedIds.value]
  if (ids.length === 0) return
  isDeleting.value = true
  sfrApi
    .deleteSfrBulk(ids)
    .then(() => {
      const toDelete = new Set(ids)
      records.value = records.value.filter(r => !toDelete.has(r.id))

      // clear selection
      selectedIds.value = []

      // ✅ close modal immediately
      showDeleteBulkModal.value = false

      addToast({ message: `Deleted ${ids.length} record(s).` })
    })
    .finally(() => (isDeleting.value = false))
}

/* ---------- Init ---------- */
onMounted(async () => {
  try {
    isLoading.value = true
    await loadLookups()
    await loadRecords()
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