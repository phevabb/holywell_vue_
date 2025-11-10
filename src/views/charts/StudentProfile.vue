<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="bg-gradient-primary text-white">
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong style="color: black;" class="fs-5">Student Profiles</strong>

            <!-- Loading text -->
    <span v-if="loading" class="text-dark fw-bold ms-3">Loading data ...</span>



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
          <div v-if="loading" class="text-center my-4">
            <CSpinner color="primary" class="me-2" /> Loading data ...
          </div>

          <CTable v-else hover responsive bordered class="shadow-sm">

            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Current Class</CTableHeaderCell>
                <CTableHeaderCell>Dad's Contact</CTableHeaderCell>
                <CTableHeaderCell>Mom's Contact</CTableHeaderCell>
                
                
                <CTableHeaderCell>Allergic Foods</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell class="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

<CTableBody>
  <!-- Loading state -->
  <CTableRow v-if="loading">
    <CTableDataCell colspan="8" class="text-center py-4">
      <CSpinner color="primary" class="me-2" /> Loading data ...
    </CTableDataCell>
  </CTableRow>

  <!-- Empty state -->
  <CTableRow v-else-if="filteredStudents.length === 0">
    <CTableDataCell colspan="8" class="text-center text-muted py-4">
      No student records found.
    </CTableDataCell>
  </CTableRow>

  <!-- Data rows -->
  <CTableRow v-else v-for="(student, idx) in filteredStudents" :key="student.id">
    <CTableHeaderCell>{{ idx + 1 }}</CTableHeaderCell>
    <CTableDataCell>{{ student.fullName }}</CTableDataCell>
    <CTableDataCell>{{ student.currentClass }}</CTableDataCell>
    <CTableDataCell>{{ student.contactOfFather }}</CTableDataCell>
    <CTableDataCell>{{ student.contactOfMother }}</CTableDataCell>
    <CTableDataCell>{{ student.allergicFoods ? student.allergicFoods : '—' }}</CTableDataCell>
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
  
  <CModal :visible="showDeleteModal" @close="cancelDelete" size="md">
  <CModalHeader class="bg-danger text-white">
    <CModalTitle>Confirm Deletion</CModalTitle>
  </CModalHeader>
  <CModalBody>
    Are you sure you want to delete <strong>{{ studentToDelete?.fullName }}</strong>?
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" variant="outline" @click="cancelDelete">Cancel</CButton>
    <CButton color="danger" @click="confirmDelete">Delete</CButton>
  </CModalFooter>
</CModal>


  <!-- Modal -->
  <CModal :visible="showFormModal" @close="closeFormModal" size="xl">
    <CModalHeader class="bg-primary text-white">
      <CModalTitle>
        <CIcon icon="cil-education" class="me-2" /> {{ isEdit ? 'Edit Student Profile' : 'Add New Student' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-4">


      <CTabs variant="pills" class="mb-3" :activeItemKey="0">
        <CTab title="Personal Info" active itemKey="personal-info">
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
              <option v-for="cls in classOptions" :key="cls.value" :value="cls.value">
                {{ cls.label }}
              </option>
            </CFormSelect>
            </div>

            
          </div>
        </CTab>

        <CTab title="Health Info" itemKey="health-info">
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

        <CTab title="Parental Info" itemKey="Parental Info">
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

        <CTab title="Other Info" itemKey="other-info">
          <div class="row g-3">
            <div class="col-md-6">
              <CFormLabel>Last School Attended</CFormLabel>
              <CFormInput v-model="form.lastSchoolAttended" />
            </div>
            <div class="col-md-6">
              <CFormLabel>Class Seeking Admission To</CFormLabel>

                       <CFormSelect v-model="form.classSeekingAdmissionTo">
                      <option v-for="cls in classOptions" :key="cls.value" :value="cls.value">
                        {{ cls.label }}
                      </option>
                      
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

              <CButton 
        color="primary" 
        class="px-4" 
        :disabled="loading" 
        @click="submitForm"
      >
        <CIcon icon="cil-save" class="me-2" />
        <span v-if="loading">Processing...</span>
        <span v-else>{{ isEdit ? 'Update' : 'Create' }}</span>
      </CButton>

      </div>
    </CModalBody>
  </CModal>

</template>

<script setup>

import { useToast } from 'vue-toastification'
const toast = useToast()
const loading = ref(false)
import { useRouter } from 'vue-router'
const router = useRouter()
const showDeleteModal = ref(false)
const studentToDelete = ref(null)




import { ref, computed,  onMounted } from 'vue'
import {st} from '@/services/api'
import {create_student} from '@/services/api'
import {update_student} from '@/services/api'
import {delete_student} from '@/services/api' 


async function fetchUsers() {
  loading.value = true

  try {
    const response = await st();

    console.log('API response:', response);

    console.log('Fetched users:', response.data);

    students.value = response.data;
    
    
    
  }  catch (err) {
    console.error('Error fetching users:', err);

    if (err.code === 'ERR_NETWORK') {
      toast.error('Network error. Please check your internet connection.', { position: 'top-right' });
    } else if (err.response) {
      // API returned an error response
      toast.error(err.response.data?.message || 'Failed to fetch students.', { position: 'top-right' });
    } else {
      // Unknown error
      toast.error('An unexpected error occurred while fetching students.', { position: 'top-right' });
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers();
});


const students = ref([])


const classOptions = [
  { label: 'Creche', value: 'CRECHE' },
  { label: 'Nursery 1', value: 'NURSERY_1' },
  { label: 'Nursery 2', value: 'NURSERY_2' },
  { label: 'KG 1', value: 'KG_1' },
  { label: 'KG 2', value: 'KG_2' },
  { label: 'Class 1', value: 'CLASS_1' },
  { label: 'Class 2', value: 'CLASS_2' },
  { label: 'Class 3', value: 'CLASS_3' },
  { label: 'Class 4', value: 'CLASS_4' },
  { label: 'Class 5', value: 'CLASS_5' },
  { label: 'Class 6', value: 'CLASS_6' },
  { label: 'JHS 1', value: 'JHS_1' },
  { label: 'JHS 2', value: 'JHS_2' },
  { label: 'JHS 3', value: 'JHS_3' },
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

/*all refs above*/

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

const submitForm = async () => {
  loading.value = true;

  try {
    console.log('Submitting form...');

    // ✅ Apply defaults BEFORE validation
    form.value.gender = form.value.gender || 'MALE';
    form.value.currentClass = form.value.currentClass || 'CRECHE';
    form.value.nationality = form.value.nationality || 'Ghanaian';
    form.value.dateOfBirth = form.value.dateOfBirth || '2002-02-02';

    // ✅ Required field validation
    const requiredFields = [
      { field: 'fullName', label: 'Full Name' },
      { field: 'contactOfFather', label: 'Contact of Father' },
      { field: 'contactOfMother', label: 'Contact of Mother' },
    ];

    for (const { field, label } of requiredFields) {
      if (!form.value[field] || form.value[field].toString().trim() === '') {
        toast.error(`${label} is required`, { position: 'top-right' });
        loading.value = false;
        return;
      }
    }

    // ✅ Clean up form: trim strings and convert empty strings to null
    const cleanedForm = Object.fromEntries(
      Object.entries(form.value).map(([key, value]) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return [key, trimmed === '' ? null : trimmed];
        }
        return [key, value];
      })
    );

    console.log('Sending cleaned form data to API:', cleanedForm);


      if (isEdit.value && currentStudent.value) {
      // ✅ Update existing student
      const response = await update_student(currentStudent.value.id, cleanedForm);
      console.log('Student updated:', response.data);

      // Update table immediately
      const index = students.value.findIndex(s => s.id === currentStudent.value.id);
      if (index !== -1) {
        students.value[index] = { ...response.data };
      }

      closeFormModal();

      toast.success('Student updated successfully!', { position: 'top-right' });
      } else {
    // ✅ Call API and wait for response
    const response = await create_student(cleanedForm);

    if (response && response.data) {
      console.log('✅ Student created successfully on the server:', response.data);

      // ✅ Update the table immediately with the new student record
      console.log("this is waht came", response)
      students.value.push(response.data);

      toast.success('Student created successfully!', { position: 'top-right' });

      // ✅ Close modal after success
      closeFormModal();

      // ✅ OPTIONAL: Delay navigation slightly to ensure UI update
      setTimeout(() => {
        router.push({ path: '/student' });
      }, 500);
    } else {
      throw new Error('No response data from the server.');
    }}

  } catch (error) {
    console.error('❌ Error creating student:', error.response?.data || error);

    const backendMessage =
      error.response?.data?.message ||
      'Failed to create student. Please check your input and try again.';

    toast.error(backendMessage, { position: 'top-right' });
  } finally {
    loading.value = false;
  }
};


const deleteStudent = (student) => {
  studentToDelete.value = student
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!studentToDelete.value) return
  loading.value = true
  showDeleteModal.value = false

  try {
    await delete_student(studentToDelete.value.id)
    students.value = students.value.filter(s => s.id !== studentToDelete.value.id)
    toast.success(`${studentToDelete.value.fullName} deleted successfully!`, { position: 'top-right' })
  } catch (error) {
    console.error('Error deleting student:', error.response?.data || error)
    toast.error('Failed to delete student. Please try again.', { position: 'top-right' })
  } finally {
    loading.value = false
    studentToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  studentToDelete.value = null
}
</script>

<style scoped>
/* Ensure header actions wrap well on smaller screens */
@media (max-width: 576px) {
  .gap-2 { row-gap: 0.5rem; }
}
</style>


