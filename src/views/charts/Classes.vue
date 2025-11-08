<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="bg-warning text-dark">
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong class="fs-5">Grade Classes</strong>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <CFormInput
                v-model="searchTerm"
                placeholder="Search class..."
                size="sm"
                style="min-width: 260px;"
              />
              <CButton color="dark" class="text-warning border-warning" size="sm" @click="openAddModal">
                <CIcon icon="cil-school" class="me-1" /> Add Class
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody>
          <CTable hover responsive bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Class Name</CTableHeaderCell>
                <CTableHeaderCell>Staff</CTableHeaderCell>
                <CTableHeaderCell class="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="(cls, idx) in filteredClasses" :key="cls.id">
                <CTableHeaderCell>{{ idx + 1 }}</CTableHeaderCell>
                <CTableDataCell>{{ cls.name }}</CTableDataCell>
                <CTableDataCell>{{ cls.staff?.fullName || '—' }}</CTableDataCell>
                <CTableDataCell class="text-end">
                  <CButtonGroup size="sm">
                    <CButton color="secondary" variant="outline" @click="openEditModal(cls)">Edit</CButton>
                    <CButton color="danger" variant="outline" @click="deleteClass(cls)">Delete</CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="filteredClasses.length === 0">
                <CTableDataCell colspan="4" class="text-center text-body-secondary">
                  No classes found<span v-if="searchTerm"> for “{{ searchTerm }}”.</span>
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
      <CModalTitle>{{ isEdit ? 'Edit Class' : 'Add Class' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CFormLabel>Class Name</CFormLabel>
      <CFormSelect v-model="form.name">
        <option disabled value="">Select Class</option>
        <option v-for="cls in classOptions" :key="cls" :value="cls">{{ cls }}</option>
      </CFormSelect>

      <CFormLabel class="mt-3">Staff (Optional)</CFormLabel>
      <CFormSelect v-model="form.staffId">
        <option value="">No Staff Assigned</option>
        <option v-for="staff in staffList" :key="staff.id" :value="staff.id">{{ staff.fullName }}</option>
      </CFormSelect>

      <div class="text-end mt-4">
        <CButton color="primary" @click="submitForm">
          {{ isEdit ? 'Update' : 'Create' }}
        </CButton>
      </div>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { ref, computed } from 'vue'

const gradeClasses = ref([
  { id: 1, name: 'CLASS_1', staffId: 1 },
  { id: 2, name: 'CLASS_2', staffId: null },
])

const staffList = ref([
  { id: 1, fullName: 'Mr. Aidoo' },
  { id: 2, fullName: 'Ms. Mensah' },
])

const classOptions = [
  'CRECHE', 'NURSERY_1', 'NURSERY_2', 'KG_1', 'KG_2',
  'CLASS_1', 'CLASS_2', 'CLASS_3', 'CLASS_4', 'CLASS_5', 'CLASS_6',
  'JHS_1', 'JHS_2', 'JHS_3'
]

const searchTerm = ref('')
const showFormModal = ref(false)
const isEdit = ref(false)
const currentClass = ref(null)

const form = ref({ name: '', staffId: '' })

const filteredClasses = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return term
    ? gradeClasses.value.filter(c => c.name.toLowerCase().includes(term))
    : gradeClasses.value
})

const openAddModal = () => {
  isEdit.value = false
  currentClass.value = null
  form.value = { name: '', staffId: '' }
  showFormModal.value = true
}

const openEditModal = (cls) => {
  isEdit.value = true
  currentClass.value = cls
  form.value = {
    name: cls.name,
    staffId: cls.staffId || ''
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  currentClass.value = null
}

const submitForm = () => {
  if (!form.value.name) return

  const staff = staffList.value.find(s => s.id === form.value.staffId)

  if (isEdit.value && currentClass.value) {
    const index = gradeClasses.value.findIndex(c => c.id === currentClass.value.id)
    if (index !== -1) {
      gradeClasses.value[index] = {
        ...form.value,
        id: currentClass.value.id,
        staff
      }
    }
  } else {
    gradeClasses.value.push({
      ...form.value,
      id: Date.now(),
      staff
    })
  }

  closeFormModal()
}

const deleteClass = (cls) => {
  if (confirm(`Delete class "${cls.name}"?`)) {
    gradeClasses.value = gradeClasses.value.filter(c => c.id !== cls.id)
  }
}
</script>

<style scoped>
/* Ensure header actions wrap well on smaller screens */
@media (max-width: 576px) {
  .gap-2 { row-gap: 0.5rem; }
}
</style>