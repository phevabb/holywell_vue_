<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong>Family Fee Records</strong>

            <!-- Actions: Search (Family) + Delete Selected + Add -->
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <CFormInput
                v-model="searchTerm"
                placeholder="Search by family name..."
                aria-label="Search by family name"
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
                Add Family Fee Record
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody>
          <p class="text-body-secondary small">
            Manage family-level fee obligations and payments by term and academic year.
          </p>

          <CAlert color="danger" v-if="errorMessage" class="py-2">
            {{ errorMessage }}
          </CAlert>

          <div class="d-flex align-items-center gap-2 mb-2" v-if="isLoading">
            <CSpinner size="sm" />
            <span class="text-body-secondary small">Loading family fee records…</span>
          </div>

          <!-- Remove <DocsExample> if not used in your project -->
          <DocsExample>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col" class="text-center" style="width: 48px;">
                    <CFormCheck
                      :checked="allSelected"
                      :indeterminate="someSelected"
                      @change="toggleSelectAll"
                      aria-label="Select all in current view"
                    />
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style="width: 60px;">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Family</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Term</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Academic Year</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-end">Amount To Pay (GHS)</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-end">Amount Paid (GHS)</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-end">Balance (GHS)</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Fully Paid</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-end" style="width: 170px;">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <CTableRow v-for="(row, idx) in filteredRecords" :key="row.id">
                  <CTableDataCell class="text-center">
                    <CFormCheck v-model="selectedIds" :value="row.id" aria-label="Select row" />
                  </CTableDataCell>

                  <CTableHeaderCell scope="row">{{ idx + 1 }}</CTableHeaderCell>
                  <CTableDataCell>{{ row.family?.name }}</CTableDataCell>
                  <CTableDataCell>{{ row.term?.name }}</CTableDataCell>
                  <CTableDataCell>{{ row.academicYear?.name }}</CTableDataCell>
                  <CTableDataCell class="text-end">{{ formatAmount(row.amountToPay) }}</CTableDataCell>
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

                <CTableRow v-if="!isLoading && filteredRecords.length === 0">
                  <CTableDataCell colspan="10" class="text-center text-body-secondary">
                    No family fee records found
                    <span v-if="searchTerm"> for “{{ searchTerm }}”.</span>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </DocsExample>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Add/Edit Modal -->
  <CModal :visible="showFormModal" @close="closeFormModal">
    <CModalHeader>
      <CModalTitle>{{ isEdit ? 'Edit Family Fee Record' : 'Add Family Fee Record' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="mb-3">
        <CFormLabel for="family">Family</CFormLabel>
        <CFormSelect id="family" v-model="form.familyId">
          <option value="" disabled>Select Family</option>
          <option v-for="f in families" :key="f.id" :value="f.id">{{ f.name }}</option>
        </CFormSelect>
      </div>

      <div class="mb-3">
        <CFormLabel for="term">Term</CFormLabel>
        <CFormSelect id="term" v-model="form.termId">
          <option value="" disabled>Select Term</option>
          <option v-for="t in terms" :key="t.id" :value="t.id">{{ t.name }}</option>
        </CFormSelect>
      </div>

      <div class="mb-3">
        <CFormLabel for="ay">Academic Year</CFormLabel>
        <CFormSelect id="ay" v-model="form.academicYearId">
          <option value="" disabled>Select Academic Year</option>
          <option v-for="ay in academicYears" :key="ay.id" :value="ay.id">{{ ay.name }}</option>
        </CFormSelect>
      </div>

      <div class="mb-3">
        <CFormLabel for="amountToPay">Amount To Pay (GHS)</CFormLabel>
        <CFormInput
          id="amountToPay"
          v-model="form.amountToPay"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          @input="recalcDerived"
        />
      </div>

      <div class="mb-3">
        <CFormLabel for="amountPaid">Amount Paid (GHS)</CFormLabel>
        <CFormInput
          id="amountPaid"
          v-model="form.amountPaid"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          @input="recalcDerived"
        />
      </div>

      <div class="mb-3">
        <CFormLabel for="balance">Balance (GHS)</CFormLabel>
        <CFormInput
          id="balance"
          :value="formatAmount(formDerived.balance)"
          disabled
          readonly
        />
        <div class="text-body-secondary small mt-1">Calculated as Amount To Pay – Amount Paid.</div>
      </div>

      <div class="mb-0">
        <CFormCheck
          id="isFullyPaid"
          :checked="formDerived.isFullyPaid"
          label="Fully Paid"
          disabled
        />
      </div>

      <!-- created date (read-only on edit) -->
      <div class="mt-2 text-body-secondary small" v-if="isEdit && viewCreated">
        Created: {{ formatDateTime(viewCreated) }}
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
    <CModalHeader><CModalTitle>Delete Family Fee Record</CModalTitle></CModalHeader>
    <CModalBody>
      Delete the record for family
      <strong>{{ deleteTarget?.family?.name }}</strong>
      — {{ deleteTarget?.term?.name }} / {{ deleteTarget?.academicYear?.name }}?
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="closeDeleteSingleModal" :disabled="isDeleting">Cancel</CButton>
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

/**
 * Simulated API aligned with FamilyFeeRecord entity:
 * FamilyFeeRecord {
 *  id, family:{id,name}, amountToPay, amountPaid, balance, isFullyPaid,
 *  term:{id,name}, academicYear:{id,name}, dateCreated (ISO)
 * }
 */
const ffrApi = (() => {
  const AY = [
    { id: 1, name: '2024/2025' },
    { id: 2, name: '2025/2026' },
  ]
  const TM = [
    { id: 100, name: 'Term 1' },
    { id: 101, name: 'Term 2' },
    { id: 102, name: 'Term 3' },
  ]
  const FAMILIES = [
    { id: 901, name: 'Boateng Family' },
    { id: 902, name: 'Mensah Family' },
    { id: 903, name: 'Owusu Family' },
  ]

  let _idCounter = 3
  let _data = [
    {
      id: 1,
      family: FAMILIES[0],
      term: TM[0],
      academicYear: AY[0],
      amountToPay: '500.00',
      amountPaid: '150.00',
      balance: '350.00',
      isFullyPaid: false,
      dateCreated: new Date('2025-09-08T09:20:00Z').toISOString(),
    },
    {
      id: 2,
      family: FAMILIES[1],
      term: TM[1],
      academicYear: AY[0],
      amountToPay: '450.00',
      amountPaid: '450.00',
      balance: '0.00',
      isFullyPaid: true,
      dateCreated: new Date('2025-09-15T12:00:00Z').toISOString(),
    },
    {
      id: 3,
      family: FAMILIES[2],
      term: TM[0],
      academicYear: AY[1],
      amountToPay: '600.00',
      amountPaid: '400.00',
      balance: '200.00',
      isFullyPaid: false,
      dateCreated: new Date('2025-10-01T15:45:00Z').toISOString(),
    },
  ]

  const byId = (list, id) => list.find(x => String(x.id) === String(id)) || null
  const nowIso = () => new Date().toISOString()
  const calcBalance = (toPay, paid) => {
    const tp = Math.max(0, Number(toPay) || 0)
    const ap = Math.max(0, Number(paid) || 0)
    const bal = Math.max(0, tp - ap)
    return { balance: bal.toFixed(2), isFullyPaid: bal === 0 }
  }
  const clone = (x) => JSON.parse(JSON.stringify(x))

  return {
    listRecords() {
      return new Promise((resolve) => setTimeout(() => resolve(clone(_data)), 450))
    },
    listFamilies() {
      return new Promise((resolve) => setTimeout(() => resolve(clone(FAMILIES)), 250))
    },
    listTerms() {
      return new Promise((resolve) => setTimeout(() => resolve(clone(TM)), 250))
    },
    listAcademicYears() {
      return new Promise((resolve) => setTimeout(() => resolve(clone(AY)), 250))
    },
    createRecord(payload /* { familyId, termId, academicYearId, amountToPay, amountPaid } */) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const fam = byId(FAMILIES, payload?.familyId)
          const tm = byId(TM, payload?.termId)
          const ay = byId(AY, payload?.academicYearId)
          const toPayNum = Number(payload?.amountToPay)
          const paidNum = Number(payload?.amountPaid)
          if (!fam) return reject(new Error('Family is required'))
          if (!tm) return reject(new Error('Term is required'))
          if (!ay) return reject(new Error('Academic Year is required'))
          if (!(toPayNum >= 0)) return reject(new Error('Amount To Pay must be non-negative'))
          if (!(paidNum >= 0)) return reject(new Error('Amount Paid must be non-negative'))

          const { balance, isFullyPaid } = calcBalance(toPayNum, paidNum)
          _idCounter += 1
          const created = {
            id: _idCounter,
            family: fam,
            term: tm,
            academicYear: ay,
            amountToPay: toPayNum.toFixed(2),
            amountPaid: paidNum.toFixed(2),
            balance,
            isFullyPaid,
            dateCreated: nowIso(),
          }
          _data = [..._data, created]
          resolve(clone(created))
        }, 450)
      })
    },
    updateRecord(id, payload /* same as create */) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const idx = _data.findIndex(r => String(r.id) === String(id))
          if (idx === -1) return reject(new Error('Record not found'))

          const fam = byId(FAMILIES, payload?.familyId)
          const tm = byId(TM, payload?.termId)
          const ay = byId(AY, payload?.academicYearId)
          const toPayNum = Number(payload?.amountToPay)
          const paidNum = Number(payload?.amountPaid)
          if (!fam) return reject(new Error('Family is required'))
          if (!tm) return reject(new Error('Term is required'))
          if (!ay) return reject(new Error('Academic Year is required'))
          if (!(toPayNum >= 0)) return reject(new Error('Amount To Pay must be non-negative'))
          if (!(paidNum >= 0)) return reject(new Error('Amount Paid must be non-negative'))

          const { balance, isFullyPaid } = calcBalance(toPayNum, paidNum)
          const updated = {
            id: _data[idx].id,
            family: fam,
            term: tm,
            academicYear: ay,
            amountToPay: toPayNum.toFixed(2),
            amountPaid: paidNum.toFixed(2),
            balance,
            isFullyPaid,
            dateCreated: _data[idx].dateCreated, // immutable
          }
          _data.splice(idx, 1, updated)
          resolve(clone(updated))
        }, 450)
      })
    },
    deleteRecord(id) {
      return new Promise((resolve) => {
        setTimeout(() => {
          _data = _data.filter(r => String(r.id) !== String(id))
          resolve({ success: true })
        }, 350)
      })
    },
    deleteRecords(ids /* number[] */) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const set = new Set(ids.map(String))
          _data = _data.filter(r => !set.has(String(r.id)))
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
const families = ref([])
const terms = ref([])
const academicYears = ref([])

/* Search */
const searchTerm = ref('')

/* Selection */
const selectedIds = ref([])

/* Form (Add/Edit) */
const showFormModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const viewCreated = ref('')
const form = reactive({
  familyId: '',
  termId: '',
  academicYearId: '',
  amountToPay: '',
  amountPaid: '',
})
const formDerived = reactive({
  balance: '0.00',
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
const filteredRecords = computed(() => {
  const q = searchTerm.value.trim().toLowerCase()
  if (!q) return records.value
  return records.value.filter(row =>
    String(row?.family?.name || '').toLowerCase().includes(q),
  )
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
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}
function resetForm() {
  form.familyId = ''
  form.termId = ''
  form.academicYearId = ''
  form.amountToPay = ''
  form.amountPaid = ''
  formDerived.balance = '0.00'
  formDerived.isFullyPaid = false
  viewCreated.value = ''
  formValidationMessage.value = ''
  editingId.value = null
}
function recalcDerived() {
  const toPay = Math.max(0, Number(form.amountToPay) || 0)
  const paid = Math.max(0, Number(form.amountPaid) || 0)
  const bal = Math.max(0, toPay - paid)
  formDerived.balance = bal.toFixed(2)
  formDerived.isFullyPaid = bal === 0
}
function validateForm() {
  if (!form.familyId) {
    formValidationMessage.value = 'Family is required.'
    return false
  }
  if (!form.termId) {
    formValidationMessage.value = 'Term is required.'
    return false
  }
  if (!form.academicYearId) {
    formValidationMessage.value = 'Academic Year is required.'
    return false
  }
  if (form.amountToPay === '' || Number(form.amountToPay) < 0) {
    formValidationMessage.value = 'Amount To Pay must be a non-negative number.'
    return false
  }
  if (form.amountPaid === '' || Number(form.amountPaid) < 0) {
    formValidationMessage.value = 'Amount Paid must be a non-negative number.'
    return false
  }
  formValidationMessage.value = ''
  return true
}

/* ---------- Select All ---------- */
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
    ffrApi.listFamilies().then(x => (families.value = x)),
    ffrApi.listTerms().then(x => (terms.value = x)),
    ffrApi.listAcademicYears().then(x => (academicYears.value = x)),
  ])
}
function loadRecords() {
  isLoading.value = true
  errorMessage.value = ''
  return ffrApi
    .listRecords()
    .then(rows => (records.value = rows))
    .catch(err => (errorMessage.value = err?.message || 'Failed to load family fee records.'))
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
  form.familyId = row?.family?.id ?? ''
  form.termId = row?.term?.id ?? ''
  form.academicYearId = row?.academicYear?.id ?? ''
  form.amountToPay = row?.amountToPay ?? ''
  form.amountPaid = row?.amountPaid ?? ''
  recalcDerived()
  viewCreated.value = row?.dateCreated || ''
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

/* ---------- Submit ---------- */
function submitForm() {
  if (!validateForm()) return
  isSubmitting.value = true

  const payload = {
    familyId: form.familyId,
    termId: form.termId,
    academicYearId: form.academicYearId,
    amountToPay: form.amountToPay,
    amountPaid: form.amountPaid,
  }

  const done = () => (isSubmitting.value = false)

  if (isEdit.value && editingId.value != null) {
    ffrApi
      .updateRecord(editingId.value, payload)
      .then((updated) => {
        records.value = records.value.map(r => (r.id === updated.id ? updated : r))
        showFormModal.value = false
        resetForm()
        addToast({ message: 'Family fee record updated.' })
      })
      .catch((err) => (formValidationMessage.value = err?.message || 'Failed to update record.'))
      .finally(done)
  } else {
    ffrApi
      .createRecord(payload)
      .then((created) => {
        records.value = [...records.value, created]
        showFormModal.value = false
        resetForm()
        addToast({ message: 'Family fee record added.' })
      })
      .catch((err) => (formValidationMessage.value = err?.message || 'Failed to add record.'))
      .finally(done)
  }
}

/* ---------- Delete ---------- */
function confirmDeleteSingle() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  ffrApi
    .deleteRecord(deleteTarget.value.id)
    .then(() => {
      records.value = records.value.filter(r => r.id !== deleteTarget.value.id)
      selectedIds.value = selectedIds.value.filter(id => id !== deleteTarget.value.id)

      // close immediately
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
  ffrApi
    .deleteRecords(ids)
    .then(() => {
      const set = new Set(ids)
      records.value = records.value.filter(r => !set.has(r.id))
      selectedIds.value = []

      // close immediately
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
@media (max-width: 576px) {
  .gap-2 { row-gap: 0.5rem; }
}
</style>
