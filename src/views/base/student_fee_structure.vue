<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">

        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong>Fee Structures</strong>

            <!-- Actions: Search (field + input) + Delete Selected + Add -->
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <!-- NEW: Search field dropdown -->
              <CFormSelect
                v-model="searchField"
                size="sm"
                style="min-width: 180px;"
                aria-label="Choose search field"
              >
                <option value="class">Search by Class</option>
                <option value="academicYear">Search by Academic Year</option>
                <option value="term">Search by Term</option>
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
              <CButton color="danger" size="sm"
                       :disabled="selectedIds.length === 0"
                       @click="openBulkDeleteConfirm">
                Delete Selected ({{ selectedIds.length }})
              </CButton>

              <!-- Add Fee Structure -->
              <CButton color="primary" size="sm" @click="openAddModal">
                Add Fee Structure
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody>
          <p class="text-body-secondary small">Fee Structures.</p>

          <!-- Error -->
          <CAlert color="danger" v-if="errorMessage" class="py-2">
            {{ errorMessage }}
          </CAlert>

          <!-- Loading -->
          <div class="d-flex align-items-center gap-2 mb-2" v-if="isLoading">
            <CSpinner size="sm" />
            <span class="text-body-secondary small">Loading fee structures…</span>
          </div>

          <DocsExample>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <!-- Select-all (affects filtered rows only) -->
                  <CTableHeaderCell scope="col" class="text-center" style="width: 48px;">
                    <CFormCheck
                      :checked="allSelected"
                      :indeterminate="someSelected"
                      @change="toggleSelectAll"
                      aria-label="Select all in current view"
                    />
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style="width: 60px;">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Academic Year</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Term</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-end">Amount (GHS)</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-end" style="width: 160px;">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <CTableRow v-for="(row, idx) in filteredFeeStructures" :key="row.id">
                  <CTableDataCell class="text-center">
                    <CFormCheck v-model="selectedIds" :value="row.id" aria-label="Select row" />
                  </CTableDataCell>

                  <CTableHeaderCell scope="row">{{ idx + 1 }}</CTableHeaderCell>
                  <CTableDataCell>{{ row.academicYear?.name }}</CTableDataCell>
                  <CTableDataCell>{{ row.gradeClass?.name }}</CTableDataCell>
                  <CTableDataCell>{{ row.term?.name }}</CTableDataCell>
                  <CTableDataCell class="text-end">
                    {{ formatAmount(row.amount) }}
                  </CTableDataCell>

                  <CTableDataCell class="text-end">
                    <CButtonGroup size="sm">
                      <CButton color="secondary" variant="outline" @click="openEditModal(row)">Edit</CButton>
                      <CButton color="danger" variant="outline" @click="openSingleDeleteConfirm(row)">Delete</CButton>
                    </CButtonGroup>
                  </CTableDataCell>
                </CTableRow>

                <!-- Empty -->
                <CTableRow v-if="!isLoading && filteredFeeStructures.length === 0">
                  <CTableDataCell colspan="7" class="text-center text-body-secondary">
                    No fee structures found
                    <span v-if="searchTerm">
                      for “{{ searchTerm }}” in
                      {{ searchField === 'academicYear' ? 'Academic Year' : (searchField === 'term' ? 'Term' : 'Class') }}.
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

  <!-- Add/Edit Modal -->
  <CModal :visible="showFormModal" @close="closeFormModal">
    <CModalHeader>
      <CModalTitle>{{ isEdit ? 'Edit Fee Structure' : 'Add Fee Structure' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="mb-3">
        <CFormLabel for="academicYear">Academic Year</CFormLabel>
        <CFormSelect id="academicYear" v-model="formFee.academicYearId">
          <option value="" disabled  selected>Select Academic Year</option>
          <option v-for="ay in academicYears" :key="ay.id" :value="ay.id">{{ ay.name }}</option>
        </CFormSelect>
      </div>

      <div class="mb-3">
        <CFormLabel for="gradeClass">Class (Grade)</CFormLabel>
        <CFormSelect id="gradeClass" v-model="formFee.gradeClassId">
          <option value="" disabled  selected >Select Class</option>
          <option v-for="gc in gradeClasses" :key="gc.id" :value="gc.id">{{ gc.name }}</option>
        </CFormSelect>
      </div>

      <div class="mb-3">
        <CFormLabel for="term">Term</CFormLabel>
        <CFormSelect id="term" v-model="formFee.termId">
          <option value="" disabled  selected>Select Term</option>
          <option v-for="t in terms" :key="t.id" :value="t.id">{{ t.name }}</option>
        </CFormSelect>
      </div>

      <div class="mb-0">
        <CFormLabel for="amount">Amount (GHS)</CFormLabel>
        <CFormInput
          id="amount"
          v-model="formFee.amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="e.g., 250.00"
        />
      </div>

      <div class="text-danger small mt-2" v-if="formValidationMessage">{{ formValidationMessage }}</div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="closeFormModal" :disabled="isSubmitting">Cancel</CButton>
      <CButton color="primary" @click="submitForm" :disabled="isSubmitting">
        <CSpinner size="sm" v-if="isSubmitting" class="me-2" /> {{ isEdit ? 'Update' : 'Save' }}
      </CButton>
    </CModalFooter>
  </CModal>

  <!-- Confirm Delete (Single) -->
  <CModal :visible="showDeleteSingleModal" @close="closeDeleteSingleModal">
    <CModalHeader><CModalTitle>Delete Fee Structure</CModalTitle></CModalHeader>
    <CModalBody>
      Are you sure you want to delete
      <strong>{{ deleteTarget?.gradeClass?.name }} / {{ deleteTarget?.term?.name }} / {{ deleteTarget?.academicYear?.name }}</strong>?
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
      You are about to delete <strong>{{ selectedIds.length }}</strong> fee structure(s). This action cannot be undone. Continue?
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="closeBulkDeleteConfirm" :disabled="isDeleting">Cancel</CButton>
      <CButton color="danger" @click="confirmDeleteBulk" :disabled="isDeleting">
        <CSpinner size="sm" v-if="isDeleting" class="me-2" />Delete Selected
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()  


/**
 * API simulation aligned to your JPA model:
 * FeeStructure {
 *   id: number,
 *   academicYear: { id, name },
 *   gradeClass:   { id, name },
 *   term:         { id, name },
 *   amount: string|number
 * }
 */
import { get_academic_years, get_classes, get_terms, create_fee_structure, get_fee_structures, update_fee_structure, delete_fee_structure } from '../../services/api'

const feeStructureApi = {
  async listAcademicYears() {
    const res = await get_academic_years()
    return res?.data || []
  },

  async listGradeClasses() {
    const res = await get_classes()
    return res?.data || []
  },

  async listTerms() {
    const res = await get_terms()
    return res?.data || []
  },

  async listFeeStructures() {
    // Assuming you have an API for fetching all fee structures
    const res = await get_fee_structures()
    return res?.data || []
  },

  async createFeeStructure(payload) {
    const res = await create_fee_structure(payload)
    return res?.data
  },

  async updateFeeStructure(id, payload) {

    console.log("updating fee structure", id, payload)
    const res = await update_fee_structure(id, payload)
    console.log("updated fee structure... yeah the out come is ress 1", res)
    console.log("updated fee structure... yeah the out come is ress 2", res.data.data)
    
    return res?.data.data
    
    
  },

  async deleteFeeStructure(id) {
    const res = await delete_fee_structure(id)
    return res?.data
  },
}


/* ---------- State ---------- */
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const errorMessage = ref('')

const feeStructures = ref([])
const academicYears = ref([])
const gradeClasses = ref([])
const terms = ref([])

/* NEW: search field */
const searchField = ref('class') // 'class' | 'academicYear' | 'term'
const searchTerm = ref('')

const selectedIds = ref([])

/* ---------- Form (Add/Edit) ---------- */
const showFormModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formFee = reactive({
  academicYearId: '',
  gradeClassId: '',
  termId: '',
  amount: '',
})
const formValidationMessage = ref('')

/* ---------- Delete Confirmation State ---------- */
const showDeleteSingleModal = ref(false)
const deleteTarget = ref(null)
const showDeleteBulkModal = ref(false)

/* ---------- Computed ---------- */
const searchPlaceholder = computed(() => {
  switch (searchField.value) {
    case 'academicYear': return 'Search academic year...'
    case 'term': return 'Search term...'
    default: return 'Search class...'
  }
})

const filteredFeeStructures = computed(() => {
  const q = searchTerm.value.trim().toLowerCase()
  if (!q) return feeStructures.value

  return feeStructures.value.filter((row) => {
    if (searchField.value === 'academicYear') {
      return String(row?.academicYear?.name || '').toLowerCase().includes(q)
    }
    if (searchField.value === 'term') {
      return String(row?.term?.name || '').toLowerCase().includes(q)
    }
    // default: class
    return String(row?.gradeClass?.name || '').toLowerCase().includes(q)
  })
})

const filteredIds = computed(() => filteredFeeStructures.value.map(r => r.id))
const allSelected = computed(() =>
  filteredIds.value.length > 0 &&
  filteredIds.value.every(id => selectedIds.value.includes(id)),
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
  formFee.academicYearId = ''
  formFee.gradeClassId = ''
  formFee.termId = ''
  formFee.amount = ''
  formValidationMessage.value = ''
  editingId.value = null
}
function validateForm() {
  if (!formFee.academicYearId || !formFee.gradeClassId || !formFee.termId) {
    formValidationMessage.value = 'Academic Year, Class and Term are required.'
    return false
  }
  if (formFee.amount === '' || Number(formFee.amount) < 0) {
    formValidationMessage.value = 'Amount must be a non-negative number.'
    return false
  }
  formValidationMessage.value = ''
  return true
}

/* ---------- Select All for current filtered view ---------- */
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
function loadReferenceData() {
  return Promise.all([
    feeStructureApi.listAcademicYears().then(x => (academicYears.value = x)),
    feeStructureApi.listGradeClasses().then(x => (gradeClasses.value = x)),
    feeStructureApi.listTerms().then(x => (terms.value = x)),
  ])
}
function loadFeeStructures() {
  isLoading.value = true
  errorMessage.value = ''
  return feeStructureApi
    .listFeeStructures()
    .then(rows => (feeStructures.value = rows))
    .catch(err => (errorMessage.value = err?.message || 'Failed to load fee structures.'))
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
  formFee.academicYearId = row.academicYear?.id ?? ''
  formFee.gradeClassId = row.gradeClass?.id ?? ''
  formFee.termId = row.term?.id ?? ''
  formFee.amount = row.amount ?? ''
  formValidationMessage.value = ''
  showFormModal.value = true
}
function closeFormModal() {
  if (!isSubmitting.value) {
    showFormModal.value = false
    resetForm()
  }
}

function openSingleDeleteConfirm(row) {
  deleteTarget.value = row
  showDeleteSingleModal.value = true
}
function closeDeleteSingleModal() {
  showDeleteSingleModal.value = false
  deleteTarget.value = null
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
    academicYearId: formFee.academicYearId,
    gradeClassId: formFee.gradeClassId,
    termId: formFee.termId,
    amount: formFee.amount,
  }

  const done = () => (isSubmitting.value = false)

  if (isEdit.value && editingId.value != null) {
    feeStructureApi
      .updateFeeStructure(editingId.value, payload)
      .then((updated) => {
        feeStructures.value = feeStructures.value.map(r => (r.id === updated.id ? updated : r))
        showFormModal.value = false
        resetForm()
        toast.success('Fee structure updated successfully.', { position: 'top-right' })
      })
      .catch((err) => (formValidationMessage.value = err?.message || 'Failed to update fee structure.'))
      .finally(done)
  } else {
    feeStructureApi
      .createFeeStructure(payload)
      .then((created) => {
        console.log("created fee structure", created)
        feeStructures.value = [...feeStructures.value, created.data]

        
        showFormModal.value = false
        toast.success('Fee structure added successfully.', { position: 'top-right' })

        resetForm()
      })
      .catch((err) => (formValidationMessage.value = err?.message || 'Failed to add fee structure.'))
      .finally(done)
  }
}

/* ---------- Delete ---------- */
async function confirmDeleteSingle() {
  if (!deleteTarget.value) return

  isDeleting.value = true
  const recordName = deleteTarget.value.name || `ID ${deleteTarget.value.id}`

  try {
    const id = deleteTarget.value.id
    await feeStructureApi.deleteFeeStructure(id)

    feeStructures.value = feeStructures.value.filter(r => r.id !== id)
    selectedIds.value = selectedIds.value.filter(selectedId => selectedId !== id)
    closeDeleteSingleModal()

    toast.success(`Fee structure deleted successfully.`, {
      position: 'top-right',
    })
  } catch (error) {
    console.error('Delete failed:', error)

    // Extract associated record name if backend provides it
    const associatedRecordName =
      error.response?.data?.associatedRecordName ||
      "a linked student's fee record"

    let message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      `Cannot delete this structure because it is linked to ${associatedRecordName}. Please delete the associated record first.`

    // Override for FK constraint errors
    if (message.includes('violates foreign key constraint')) {
      message = `Cannot delete this structure because it is linked to ${associatedRecordName}. Please delete the associated record first.`
    }

    toast.error(message, { position: 'top-right' })
  } finally {
    isDeleting.value = false
  }
}




/* ---------- Init ---------- */
onMounted(async () => {
  try {
    isLoading.value = true
    await loadReferenceData()
    await loadFeeStructures()
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