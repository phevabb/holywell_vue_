<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="bg-info text-white">
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong class="fs-5">Academic Years</strong>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <CFormInput
                v-model="searchTerm"
                placeholder="Search academic year..."
                size="sm"
                style="min-width: 260px;"
              />
              <CButton color="light" class="text-info border-info" size="sm" @click="openAddModal">
                <CIcon icon="cil-calendar" class="me-1" /> Add Year
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody>
          <CTable hover responsive bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell class="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="(year, idx) in filteredYears" :key="year.id">
                <CTableHeaderCell>{{ idx + 1 }}</CTableHeaderCell>
                <CTableDataCell>{{ year.name }}</CTableDataCell>
                <CTableDataCell class="text-end">
                  <CButtonGroup size="sm">
                    <CButton color="secondary" variant="outline" @click="openEditModal(year)">Edit</CButton>
                    <CButton color="danger" variant="outline" @click="deleteYear(year)">Delete</CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="filteredYears.length === 0">
                <CTableDataCell colspan="3" class="text-center text-body-secondary">
                  No academic years found<span v-if="searchTerm"> for “{{ searchTerm }}”.</span>
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
      <CModalTitle>{{ isEdit ? 'Edit Academic Year' : 'Add Academic Year' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CFormLabel>Name</CFormLabel>
      <CFormInput v-model="form.name" placeholder="e.g. 2024/2025" />
      <div class="text-end mt-3">
        <CButton color="primary" @click="submitForm">
          {{ isEdit ? 'Update' : 'Create' }}
        </CButton>
      </div>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { ref, computed } from 'vue'

const academicYears = ref([
  { id: 1, name: '2023/2024' },
  { id: 2, name: '2024/2025' },
])

const searchTerm = ref('')
const showFormModal = ref(false)
const isEdit = ref(false)
const currentYear = ref(null)

const form = ref({ name: '' })

const filteredYears = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return term
    ? academicYears.value.filter(y => y.name.toLowerCase().includes(term))
    : academicYears.value
})

const openAddModal = () => {
  isEdit.value = false
  currentYear.value = null
  form.value = { name: '' }
  showFormModal.value = true
}

const openEditModal = (year) => {
  isEdit.value = true
  currentYear.value = year
  form.value = { name: year.name }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  currentYear.value = null
}

const submitForm = () => {
  if (!form.value.name.trim()) return

  if (isEdit.value && currentYear.value) {
    const index = academicYears.value.findIndex(y => y.id === currentYear.value.id)
    if (index !== -1) academicYears.value[index] = { ...form.value, id: currentYear.value.id }
  } else {
    academicYears.value.push({ ...form.value, id: Date.now() })
  }

  closeFormModal()
}

const deleteYear = (year) => {
  if (confirm(`Delete academic year "${year.name}"?`)) {
    academicYears.value = academicYears.value.filter(y => y.id !== year.id)
  }
}
</script>

<style scoped>
/* Ensure header actions wrap well on smaller screens */
@media (max-width: 576px) {
  .gap-2 { row-gap: 0.5rem; }
}
</style>
