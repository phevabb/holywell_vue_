<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong>Families</strong>

            <!-- Actions: Search + Delete Selected + Add -->
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <!-- Search by name -->
              <CFormInput
                v-model="searchTerm"
                placeholder="Search by family name..."
                aria-label="Search by family name"
                size="sm"
                style="min-width: 260px;"
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

              <!-- Add Family -->
              <CButton color="primary" size="sm" @click="openAddModal">
                Add Family
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody>
          <p class="text-body-secondary small">Create families and manage their student members (relatives).</p>

          <!-- Error -->
          <CAlert color="danger" v-if="errorMessage" class="py-2">
            {{ errorMessage }}
          </CAlert>

          <!-- Loading -->
          <div class="d-flex align-items-center gap-2 mb-2" v-if="isLoading">
            <CSpinner size="sm" />
            <span class="text-body-secondary small">Loading families…</span>
          </div>

          <!-- TABLE -->
          <!-- Remove <DocsExample> if your project doesn't include it -->
          <DocsExample>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <!-- Select-all (applies to current filtered rows) -->
                  <CTableHeaderCell scope="col" class="text-center" style="width: 48px;">
                    <CFormCheck
                      :checked="allSelected"
                      :indeterminate="someSelected"
                      @change="toggleSelectAll"
                      aria-label="Select all in current view"
                    />
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style="width: 60px;">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Members (Preview)</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-end">Count</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-end" style="width: 240px;">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <CTableRow v-for="(row, idx) in filteredFamilies" :key="row.id">
                  <CTableDataCell class="text-center">
                    <CFormCheck v-model="selectedIds" :value="row.id" aria-label="Select row" />
                  </CTableDataCell>

                  <CTableHeaderCell scope="row">{{ idx + 1 }}</CTableHeaderCell>
                  <CTableDataCell>{{ row.name }}</CTableDataCell>

                  <CTableDataCell>
                    <span v-if="(row.members?.length || 0) === 0" class="text-body-secondary">No members</span>
                    <span v-else>{{ previewMembers(row.members) }}</span>
                  </CTableDataCell>

                  <CTableDataCell class="text-end">
                    <CBadge color="info">{{ row.members?.length || 0 }}</CBadge>
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
                <CTableRow v-if="!isLoading && filteredFamilies.length === 0">
                  <CTableDataCell colspan="6" class="text-center text-body-secondary">
                    No families found
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

  <!-- Add/Edit Family Modal (with members selection) -->
  <CModal :visible="showFormModal" @close="closeFormModal">
    <CModalHeader>
      <CModalTitle>{{ isEdit ? 'Edit Family' : 'Add Family' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="mb-3">
        <CFormLabel for="name">Family Name</CFormLabel>
        <CFormInput
          id="name"
          v-model="formFamily.name"
          type="text"
          :maxlength="100"
          placeholder="Enter family name (max 100 chars)"
        />
        <div class="text-body-secondary small mt-1">
          Must be unique. Max 100 characters.
        </div>
      </div>

      <div class="mb-2 d-flex justify-content-between align-items-center">
        <CFormLabel class="mb-0">Members (Students)</CFormLabel>
        <CFormInput
          v-model="memberSearch"
          size="sm"
          placeholder="Filter students..."
          style="max-width: 220px;"
        />
      </div>

      <!-- Multi-select for members -->
      <CFormSelect
        v-model="formFamily.memberIds"
        multiple
        :size="8"
        aria-label="Select family members"
      >
        <option
          v-for="st in filteredStudentOptions"
          :key="st.id"
          :value="String(st.id)"
        >
          {{ st.fullName }}
        </option>
      </CFormSelect>

      <div class="text-danger small mt-2" v-if="formValidationMessage">
        {{ formValidationMessage }}
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="closeFormModal" :disabled="isSubmitting">
        Cancel
      </CButton>
      <CButton color="primary" @click="submitForm" :disabled="isSubmitting">
        <CSpinner size="sm" v-if="isSubmitting" class="me-2" />
        {{ isEdit ? 'Update' : 'Save' }}
      </CButton>
    </CModalFooter>
  </CModal>

  <!-- Manage Members Modal (quick members edit) -->
  <CModal :visible="showMembersModal" @close="closeMembersModal" size="lg">
    <CModalHeader>
      <CModalTitle>Manage Members — {{ currentFamily?.name }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="mb-2 d-flex justify-content-between align-items-center">
        <div class="text-body-secondary small">
          Select or remove students to update family members.
        </div>
        <CFormInput
          v-model="memberSearch"
          size="sm"
          placeholder="Filter students..."
          style="max-width: 220px;"
        />
      </div>

      <CRow>
        <CCol :md="12">
          <CFormSelect
            v-model="membersEdit.memberIds"
            multiple
            :size="12"
            aria-label="Select family members"
          >
            <option
              v-for="st in filteredStudentOptions"
              :key="st.id"
              :value="String(st.id)"
            >
              {{ st.fullName }}
            </option>
          </CFormSelect>
        </CCol>
      </CRow>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="closeMembersModal" :disabled="isSubmitting">
        Cancel
      </CButton>
      <CButton color="primary" @click="submitMembersUpdate" :disabled="isSubmitting">
        <CSpinner size="sm" v-if="isSubmitting" class="me-2" />
        Save Members
      </CButton>
    </CModalFooter>
  </CModal>

  <!-- Confirm Delete (Single) -->
  <CModal :visible="showDeleteSingleModal" @close="closeDeleteSingleModal">
    <CModalHeader><CModalTitle>Delete Family</CModalTitle></CModalHeader>
    <CModalBody>
      Delete family <strong>{{ deleteTarget?.name }}</strong>?
      <div class="text-body-secondary small mt-1" v-if="deleteTarget?.members?.length">
        This family has {{ deleteTarget.members.length }} member(s).
      </div>
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
      You are about to delete <strong>{{ selectedIds.length }}</strong> family(ies).
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

import { st, get_families, create_family, update_family, delete_family } from '../../services/api'
import {useToast} from 'vue-toastification'

const toast = useToast()

const familyApi = (() => {
  const clone = (x) => JSON.parse(JSON.stringify(x))

  return {
    async listFamilies() {
      try {
        const response = await get_families()
        return clone(response.data || [])
      } catch (error) {
        console.error('Error fetching families:', error)
        throw error
      }
    },

    async listStudents() {
      try {
        const response = await st()
        return clone(response.data || [])
      } catch (error) {
        console.error('Error fetching students:', error)
        throw error
      }
    },

    async createFamily(payload /* { name, memberIds } */) {
      try {
        const response = await create_family(payload)
        return clone(response.data || response)
      } catch (error) {
        console.error('Error creating family:', error)
        throw error
      }
    },

    async updateFamily(id, payload /* { name, memberIds } */) {
      try {
        const response = await update_family(id, payload)
        return clone(response.data || response)
      } catch (error) {
        console.error('Error updating family:', error)
        throw error
      }
    },

    async updateFamilyMembers(id, memberIds /* number[]|string[] */) {
      try {
        const payload = { memberIds }
        const response = await update_family(id, payload)
        return clone(response.data || response)
      } catch (error) {
        console.error('Error updating family members:', error)
        throw error
      }
    },

    async deleteFamily(id) {
      try {
        const response = await delete_family(id)
        toast.success('Family deleted successfully.')
        return { success: true, ...(response.data || {}) }
      } catch (error) {
        console.error('Error deleting family:', error)
        throw error
      }
    },

    async deleteFamilies(ids /* number[] */) {
      try {
        const results = await Promise.allSettled(ids.map(id => delete_family(id)))

        const successCount = results.filter(r => r.status === 'fulfilled').length
        const failCount = results.filter(r => r.status === 'rejected').length

        return { success: failCount === 0, deleted: successCount, failed: failCount }
      } catch (error) {
        console.error('Error deleting multiple families:', error)
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

const families = ref([])
const students = ref([])

/* Search controls */
const searchTerm = ref('')

/* Selection */
const selectedIds = ref([])

/* Form (Add/Edit) */
const showFormModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formFamily = reactive({
  name: '',
  memberIds: [], // array of strings (from <option value>)
})
const formValidationMessage = ref('')

/* Members modal */
const showMembersModal = ref(false)
const currentFamily = ref(null)
const membersEdit = reactive({
  memberIds: [], // array of strings
})
/* shared member filter */
const memberSearch = ref('')

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
const filteredFamilies = computed(() => {
  const q = searchTerm.value.trim().toLowerCase()
  if (!q) return families.value
  return families.value.filter(row => String(row?.name || '').toLowerCase().includes(q))
})

const filteredIds = computed(() => filteredFamilies.value.map(r => r.id))
const allSelected = computed(() =>
  filteredIds.value.length > 0 && filteredIds.value.every(id => selectedIds.value.includes(id)),
)
const someSelected = computed(() =>
  filteredIds.value.length > 0 &&
  !allSelected.value &&
  filteredIds.value.some(id => selectedIds.value.includes(id)),
)

const filteredStudentOptions = computed(() => {
  const q = memberSearch.value.trim().toLowerCase()
  if (!q) return students.value
  return students.value.filter(s => String(s.fullName || '').toLowerCase().includes(q))
})

/* ---------- Helpers ---------- */
function previewMembers(members) {
  return (members || []).map(m => m.fullName).join(', ')
}


function resetForm() {
  formFamily.name = ''
  formFamily.memberIds = []
  memberSearch.value = ''
  formValidationMessage.value = ''
  editingId.value = null
}

function validateForm() {
  const name = String(formFamily.name || '').trim()
  if (!name) {
    formValidationMessage.value = 'Family name is required.'
    return false
  }
  if (name.length > 100) {
    formValidationMessage.value = 'Name must be at most 100 characters.'
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
function loadFamilies() {
  isLoading.value = true
  errorMessage.value = ''
  return familyApi
    .listFamilies()
    .then(rows => (families.value = rows))
    .catch(err => (errorMessage.value = err?.message || 'Failed to load families.'))
    .finally(() => (isLoading.value = false))
}
function loadStudents() {
  return familyApi.listStudents().then(rows => (students.value = rows))
}

/* ---------- Modal handlers (Add/Edit) ---------- */
function openAddModal() {
  isEdit.value = false
  resetForm()
  showFormModal.value = true
}
function openEditModal(row) {
  isEdit.value = true
  editingId.value = row.id
  formFamily.name = row?.name ?? ''
  formFamily.memberIds = (row?.members || []).map(m => String(m.id))
  memberSearch.value = ''
  formValidationMessage.value = ''
  showFormModal.value = true
}
function closeFormModal() {
  if (!isSubmitting.value) {
    showFormModal.value = false
    resetForm()
  }
}

/* ---------- Members modal handlers ---------- */
function openMembersModal(row) {
  currentFamily.value = row
  membersEdit.memberIds = (row?.members || []).map(m => String(m.id))
  memberSearch.value = ''
  showMembersModal.value = true
}
function closeMembersModal() {
  if (!isSubmitting.value) {
    showMembersModal.value = false
    currentFamily.value = null
    membersEdit.memberIds = []
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

  // Backends typically expect numeric IDs; convert from strings
  const memberIdsNumeric = (formFamily.memberIds || []).map(v => Number(v))

  const payload = {
    name: formFamily.name,
    memberIds: memberIdsNumeric,
  }

  const done = () => (isSubmitting.value = false)

  if (isEdit.value && editingId.value != null) {
    familyApi
      .updateFamily(editingId.value, payload)
      .then((updated) => {
        families.value = families.value.map(r => (r.id === updated.id ? updated : r))
        showFormModal.value = false
        resetForm()
        addToast({ message: 'Family updated.' })
      })
      .catch((err) => (formValidationMessage.value = err?.message || 'Failed to update family.'))
      .finally(done)
  } else {
    familyApi
      .createFamily(payload)
      .then((created) => {
        families.value = [...families.value, created]
        showFormModal.value = false
        resetForm()
        toast.success('Family created successfully.')

      })
      .catch((err) => (formValidationMessage.value = err?.message || 'Failed to add family.'))
      .finally(done)
  }
}

/* ---------- Submit (Members update) ---------- */
function submitMembersUpdate() {
  if (!currentFamily.value) return
  isSubmitting.value = true

  const memberIdsNumeric = (membersEdit.memberIds || []).map(v => Number(v))

  familyApi
    .updateFamilyMembers(currentFamily.value.id, memberIdsNumeric)
    .then((updated) => {
      families.value = families.value.map(r => (r.id === updated.id ? updated : r))
      // ✅ close modal immediately
      showMembersModal.value = false
      currentFamily.value = null
      membersEdit.memberIds = []
      addToast({ message: 'Members updated.' })
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

/* ---------- Delete (Single/Bulk) ---------- */
async function confirmDeleteSingle() {
  if (!deleteTarget.value) return

  isDeleting.value = true
  const familyId = deleteTarget.value.id
  const familyName = deleteTarget.value.name

  console.log("Deleting family ID:", familyId)

  try {
    const response = await delete_family(familyId)
    console.log("Delete response:", response)

    // Remove from local list
    families.value = families.value.filter(f => f.id !== familyId)
    selectedIds.value = selectedIds.value.filter(id => id !== familyId)

    toast.success(`Family "${familyName}" deleted successfully.`, { position: 'top-right' })
  } catch (err) {
    console.error('Error deleting family:', err)

    let message = `Failed to delete "${familyName}". Connected to another record`
    
    // Detect foreign key / constraint errors from backend
    const backendMsg = err.response?.data?.message || err.response?.data?.error
    if (backendMsg?.toLowerCase().includes('foreign key') || backendMsg?.toLowerCase().includes('constraint')) {
      message = `Cannot delete "${familyName}" because it is linked to a student or record. Remove the associated record first.`
    }

    toast.error(message, { position: 'top-right' })
  } finally {
    showDeleteSingleModal.value = false
    deleteTarget.value = null
    isDeleting.value = false
  }
}



function confirmDeleteBulk() {
  const ids = [...selectedIds.value]
  if (ids.length === 0) return
  isDeleting.value = true
  familyApi
    .deleteFamilies(ids)
    .then(() => {
      const toDelete = new Set(ids.map(String))
      families.value = families.value.filter(r => !toDelete.has(String(r.id)))
      selectedIds.value = []
      // ✅ close modal
      showDeleteBulkModal.value = false
      addToast({ message: `Deleted ${ids.length} family(ies).` })
    })
    .finally(() => (isDeleting.value = false))
}

/* ---------- Init ---------- */
onMounted(async () => {
  try {
    isLoading.value = true
    await loadStudents()
    await loadFamilies()
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Ensure header actions wrap well on smaller screens */
@media (max-width: 576px) {
  .gap-2 { row-gap: 0.5rem; }
}
</style>