<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong>Staff Members</strong>

            <div class="d-flex align-items-center gap-2 flex-wrap">
              <CFormInput
                v-model="searchTerm"
                placeholder="Search by name..."
                aria-label="Search by name"
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
                Add Staff
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
            <span class="text-body-secondary small">Loading staff…</span>
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
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Gender</CTableHeaderCell>
                <CTableHeaderCell>Nationality</CTableHeaderCell>
                <CTableHeaderCell>Date of Birth</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell class="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              <CTableRow v-for="(row, idx) in filteredStaff" :key="row.id">
                <CTableDataCell class="text-center">
                  <CFormCheck v-model="selectedIds" :value="row.id" />
                </CTableDataCell>
                <CTableHeaderCell>{{ idx + 1 }}</CTableHeaderCell>
                <CTableDataCell>{{ row.fullName }}</CTableDataCell>
                <CTableDataCell>{{ row.role }}</CTableDataCell>
                <CTableDataCell>{{ row.gender }}</CTableDataCell>
                <CTableDataCell>{{ row.nationality }}</CTableDataCell>
                <CTableDataCell>{{ row.dateOfBirth }}</CTableDataCell>
                <CTableDataCell>
                  <CBadge :color="row.active ? 'success' : 'secondary'">
                    {{ row.active ? 'Active' : 'Inactive' }}
                  </CBadge>
                </CTableDataCell>
                <CTableDataCell class="text-end">
                  <CButtonGroup size="sm">
                    <CButton color="secondary" variant="outline" @click="openEditModal(row)">Edit</CButton>
                    <CButton color="danger" variant="outline" @click="openSingleDeleteConfirm(row)">Delete</CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>

              <CTableRow v-if="!isLoading && filteredStaff.length === 0">
                <CTableDataCell colspan="9" class="text-center text-body-secondary">
                  No staff found<span v-if="searchTerm"> for “{{ searchTerm }}”.</span>
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
      <CModalTitle>{{ isEdit ? 'Edit Staff' : 'Add Staff' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="mb-3">
        <CFormLabel>Full Name</CFormLabel>
        <CFormInput v-model="form.fullName" />
      </div>
      <div class="mb-3">
        <CFormLabel>Gender</CFormLabel>
        <CFormSelect v-model="form.gender">
          <option disabled value="">Select Gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </CFormSelect>
      </div>
      <div class="mb-3">
        <CFormLabel>Nationality</CFormLabel>
        <CFormInput v-model="form.nationality" />
      </div>
      <div class="mb-3">
        <CFormLabel>Date of Birth</CFormLabel>
        <CFormInput v-model="form.dateOfBirth" type="date" />
      </div>
      <div class="mb-3">
        <CFormLabel>Role</CFormLabel>
        <CFormSelect v-model="form.role">
          <option value="TEACHER">Teacher</option>
          <option value="PRINCIPAL">Principal</option>
          <option value="STUDENT">Student</option>
        </CFormSelect>
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
  CAlert, CSpinner, CFormLabel, CFormSelect, CBadge, CRow, CCol, CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell
} from '@coreui/vue'

// Simulated store
let staffStore = []
let nextId = 1

const listStaff = async () => new Promise(resolve => setTimeout(() => resolve([...staffStore]), 300))
const createStaff = async (data) => {
  const newStaff = {
    id: nextId++,
    userId: `user${nextId}`,
    password: 'hashed_password',
    active: true,
    staff: true,
    ...data,
  }
  staffStore.push(newStaff)
  return new Promise(resolve => setTimeout(() => resolve(newStaff), 300))
}
const updateStaff = async (id, data) => {
  const index = staffStore.findIndex(s => s.id === id)
  if (index !== -1) {
    staffStore[index] = { ...staffStore[index], ...data }
  }
  return new Promise(resolve => setTimeout(() => resolve(staffStore[index]), 300))
}
const deleteStaff = async (id) => {
  staffStore = staffStore.filter(s => s.id !== id)
  return new Promise(resolve => setTimeout(() => resolve(true), 300))
}
const bulkDeleteStaff = async (ids) => {
  staffStore = staffStore.filter(s => !ids.includes(s.id))
  return new Promise(resolve => setTimeout(() => resolve(true), 300))
}

// Component state
const staff = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchTerm = ref('')
const selectedIds = ref([])
const showFormModal = ref(false)
const isEdit = ref(false)
const currentStaff = ref(null)

const form = ref({
  fullName: '',
  gender: '',
  nationality: '',
  dateOfBirth: '',
  role: 'TEACHER',
})

const fetchStaff = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    staff.value = await listStaff()
  } catch (err) {
    errorMessage.value = 'Failed to load staff.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchStaff)

const filteredStaff = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return staff.value
  return staff.value.filter(s => s.fullName.toLowerCase().includes(term))
})

const allSelected = computed(() => selectedIds.value.length === filteredStaff.value.length && filteredStaff.value.length > 0)
const someSelected = computed(() => selectedIds.value.length > 0 && selectedIds.value.length < filteredStaff.value.length)

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredStaff.value.map(s => s.id)
  }
}

const openAddModal = () => {
  isEdit.value = false
  currentStaff.value = null
  form.value = {
    fullName: '',
    gender: '',
    nationality: '',
    dateOfBirth: '',
    role: 'TEACHER',
  }
  showFormModal.value = true
}

const openEditModal = (staffMember) => {
  isEdit.value = true
  currentStaff.value = staffMember
  form.value = {
    fullName: staffMember.fullName,
    gender: staffMember.gender,
    nationality: staffMember.nationality,
    dateOfBirth: staffMember.dateOfBirth,
    role: staffMember.role,
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  currentStaff.value = null
}

const submitForm = async () => {
  try {
    if (isEdit.value && currentStaff.value) {
      await updateStaff(currentStaff.value.id, form.value)
    } else {
      await createStaff(form.value)
    }
    await fetchStaff()
    closeFormModal()
  } catch (err) {
    errorMessage.value = 'Failed to save staff.'
  }
}

const openSingleDeleteConfirm = async (staffMember) => {
  if (confirm(`Delete ${staffMember.fullName}?`)) {
    await deleteStaff(staffMember.id)
    await fetchStaff()
  }
}

const openBulkDeleteConfirm = async () => {
  if (confirm(`Delete ${selectedIds.value.length} selected staff members?`)) {
    await bulkDeleteStaff(selectedIds.value)
    selectedIds.value = []
    await fetchStaff()
  }
}
</script>

<style scoped>
/* Ensure header actions wrap well on smaller screens */
@media (max-width: 576px) {
  .gap-2 { row-gap: 0.5rem; }
}
</style>

