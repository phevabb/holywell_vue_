<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="bg-gradient-primary text-white">
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong style="color: black;" class="fs-5">Student Profiles</strong>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <CFormInput
                v-model="searchTerm"
                placeholder="Search by name..."
                size="sm"
                class="shadow-sm border-primary"
                style="min-width: 260px;"
              />
              <CButton color="light" class="text-primary border-primary" size="sm" @click="openAddModal">
                <CIcon icon="cil-user-follow" class="me-1" /> Add Student
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody>
          <CTable hover responsive bordered class="shadow-sm">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Gender</CTableHeaderCell>
                <CTableHeaderCell>Nationality</CTableHeaderCell>
                <CTableHeaderCell>Date of Birth</CTableHeaderCell>
                <CTableHeaderCell>Current Class</CTableHeaderCell>
                <CTableHeaderCell>Family</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell class="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="(student, idx) in filteredStudents" :key="student.id">
                <CTableHeaderCell>{{ idx + 1 }}</CTableHeaderCell>
                <CTableDataCell>{{ student.fullName }}</CTableDataCell>
                <CTableDataCell>{{ student.gender }}</CTableDataCell>
                <CTableDataCell>{{ student.nationality }}</CTableDataCell>
                <CTableDataCell>{{ student.dateOfBirth }}</CTableDataCell>
                <CTableDataCell>{{ student.currentClass }}</CTableDataCell>
                <CTableDataCell>{{ student.familyId ? families.find(f => f.id === student.familyId)?.name : '—' }}</CTableDataCell>
                <CTableDataCell>
                  <CBadge :color="student.active ? 'success' : 'secondary'">
                    {{ student.active ? 'Active' : 'Inactive' }}
                  </CBadge>
                </CTableDataCell>
                <CTableDataCell class="text-end">
                  <CButtonGroup size="sm">
                    <CButton color="secondary" variant="outline" @click="openEditModal(student)">Edit</CButton>
                    <CButton color="danger" variant="outline" @click="deleteStudent(student)">Delete</CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Modal -->
  <CModal :visible="showFormModal" @close="closeFormModal" size="xl">
    <CModalHeader class="bg-primary text-white">
      <CModalTitle>
        <CIcon icon="cil-education" class="me-2" /> {{ isEdit ? 'Edit Student Profile' : 'Add New Student' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-4">
      <CTabs variant="pills" class="mb-3">
        <CTab title="Personal Info" active>
          <div class="row g-3">
            <div class="col-md-6">
              <CFormLabel>Full Name</CFormLabel>
              <CFormInput v-model="form.fullName" />
            </div>
            <div class="col-md-3">
              <CFormLabel>Gender</CFormLabel>
                <CFormSelect v-model="form.gender">
                <option disabled value="">Choose Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                </CFormSelect>
            </div>
            <div class="col-md-3">
              <CFormLabel>Date of Birth</CFormLabel>
              <CFormInput type="date" v-model="form.dateOfBirth" />
            </div>
            <div class="col-md-6">
              <CFormLabel>Nationality</CFormLabel>
              <CFormInput v-model="form.nationality" />
            </div>
            <div class="col-md-6">
              <CFormLabel>Current Class</CFormLabel>
              <CFormSelect v-model="form.currentClass">
                <option v-for="cls in classOptions" :key="cls" :value="cls">{{ cls }}</option>
              </CFormSelect>
            </div>
            <div class="col-md-12">
              <CFormLabel>Family</CFormLabel>
              <CFormSelect v-model="form.familyId">
                <option value="">No Family / Not Applicable</option>
                <option v-for="fam in families" :key="fam.id" :value="fam.id">{{ fam.name }}</option>
              </CFormSelect>
            </div>
          </div>
        </CTab>

        <CTab title="Health Info">
          <div class="row g-3">
            <div class="col-md-6">
              <CFormCheck v-model="form.immunized" label="Immunized" />
              <CFormCheck v-model="form.allergies" label="Has Allergies" />
              <CFormLabel>Allergic Foods</CFormLabel>
              <CFormInput v-model="form.allergicFoods" />
            </div>
            <div class="col-md-6">
              <CFormCheck v-model="form.hasPeculiarHealthIssues" label="Has Health Issues" />
              <CFormLabel>Health Issues</CFormLabel>
              <CFormTextarea v-model="form.healthIssues" rows="3" />
            </div>
          </div>
        </CTab>

        <CTab title="Parental Info">
          <div class="row g-3">
            <div class="col-md-6">
              <CFormLabel>Name of Father</CFormLabel>
              <CFormInput v-model="form.nameOfFather" />
              <CFormLabel>Occupation of Father</CFormLabel>
              <CFormInput v-model="form.occupationOfFather" />
              <CFormLabel>Contact of Father</CFormLabel>
              <CFormInput v-model="form.contactOfFather" />
              <CFormLabel>Nationality of Father</CFormLabel>
              <CFormInput v-model="form.nationalityOfFather" />
            </div>
            <div class="col-md-6">
              <CFormLabel>Name of Mother</CFormLabel>
              <CFormInput v-model="form.nameOfMother" />
              <CFormLabel>Occupation of Mother</CFormLabel>
              <CFormInput v-model="form.occupationOfMother" />
              <CFormLabel>Contact of Mother</CFormLabel>
              <CFormInput v-model="form.contactOfMother" />
              <CFormLabel>Nationality of Mother</CFormLabel>
              <CFormInput v-model="form.nationalityOfMother" />
            </div>
          </div>
        </CTab>

        <CTab title="Other Info">
          <div class="row g-3">
            <div class="col-md-6">
              <CFormLabel>Last School Attended</CFormLabel>
              <CFormInput v-model="form.lastSchoolAttended" />
            </div>
            <div class="col-md-6">
              <CFormLabel>Class Seeking Admission To</CFormLabel>
              <CFormSelect v-model="form.classSeekingAdmissionTo">
                <option v-for="cls in classOptions" :key="cls" :value="cls">{{ cls }}</option>
              </CFormSelect>
            </div>
            <div class="col-md-6">
              <CFormLabel>House Number</CFormLabel>
              <CFormInput v-model="form.houseNumber" />
            </div>
            <div class="col-md-6">
              <CFormLabel>Other Related Info</CFormLabel>
              <CFormTextarea v-model="form.otherRelatedInfo" rows="3" />
            </div>
          </div>
        </CTab>
      </CTabs>
      <div class="text-end">
        <CButton color="primary" class="px-4" @click="submitForm">
          <CIcon icon="cil-save" class="me-2" /> {{ isEdit ? 'Update' : 'Create' }}
        </CButton>
      </div>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { ref, computed } from 'vue'

const students = ref([])
const families = ref([{ id: 1, name: 'Aidoo Family' }, { id: 2, name: 'Mensah Family' }])
const classOptions = [
  'Creche', 'Nursery 1', 'Nursery 2', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
  'JHS 1', 'JHS 2', 'JHS 3'
]

const searchTerm = ref('')
const showFormModal = ref(false)
const isEdit = ref(false)
const currentStudent = ref(null)

const form = ref({
  fullName: '', gender: '', nationality: '', dateOfBirth: '', currentClass: '', familyId: '',
  immunized: false, allergies: false, allergicFoods: '', hasPeculiarHealthIssues: false, healthIssues: '',
  nameOfFather: '', occupationOfFather: '', contactOfFather: '', nationalityOfFather: '',
  nameOfMother: '', occupationOfMother: '', contactOfMother: '', nationalityOfMother: '',
  lastSchoolAttended: '', classSeekingAdmissionTo: '', houseNumber: '', otherRelatedInfo: '',
  active: true, staff: false, role: 'STUDENT'
})

const filteredStudents = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return term ? students.value.filter(s => s.fullName.toLowerCase().includes(term)) : students.value
})

const openAddModal = () => {
  isEdit.value = false
  currentStudent.value = null
  form.value = { ...form.value, fullName: '', gender: '', nationality: '', dateOfBirth: '', currentClass: '', familyId: '' }
  showFormModal.value = true
}

const openEditModal = (student) => {
  isEdit.value = true
  currentStudent.value = student
  form.value = { ...student }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  currentStudent.value = null
}


const submitForm = () => {
  // Set default gender if not selected
  if (!form.value.gender) {
    form.value.gender = 'MALE'
  }

  // Set default class if not selected
  if (!form.value.currentClass) {
    form.value.currentClass = 'Creche'
  }

  // Set default nationality if not provided
  if (!form.value.nationality) {
    form.value.nationality = 'Ghanaian'
  }

  if (isEdit.value && currentStudent.value) {
    const index = students.value.findIndex(s => s.id === currentStudent.value.id)
    if (index !== -1) {
      students.value[index] = { ...form.value, id: currentStudent.value.id }
    }
  } else {
    students.value.push({ ...form.value, id: Date.now() })
  }

  closeFormModal()
}



const deleteStudent = (student) => {
  if (confirm(`Are you sure you want to delete ${student.fullName}?`)) {
    students.value = students.value.filter(s => s.id !== student.id)
  }
}
</script>

<style scoped>
/* Ensure header actions wrap well on smaller screens */
@media (max-width: 576px) {
  .gap-2 { row-gap: 0.5rem; }
}
</style>


