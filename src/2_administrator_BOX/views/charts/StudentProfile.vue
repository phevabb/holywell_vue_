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

              <!-- Bulk delete -->
              <CButton
                color="danger"
                size="sm"
                :disabled="selectedIds.length === 0"
                @click="openBulkDeleteConfirm"
              >
                Delete Selected ({{ selectedIds.length }})
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

                  <!-- Select-all (applies to filtered rows) -->
                  <CTableHeaderCell scope="col" class="text-center" style="width: 48px;">
                    <CFormCheck
                      :checked="allSelected"
                      :indeterminate="someSelected"
                      @change="toggleSelectAll"
                      aria-label="Select all in current view"
                    />
                  </CTableHeaderCell>

                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
        
                <CTableHeaderCell>Current Class</CTableHeaderCell>
                <CTableHeaderCell>Dad's Contact</CTableHeaderCell>
                <CTableHeaderCell>Mom's Contact</CTableHeaderCell>
                <CTableHeaderCell>Has Discount</CTableHeaderCell>
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
    
    
    <CTableDataCell class="text-center">
                    <CFormCheck v-model="selectedIds" :value="student.id" aria-label="Select row" />
    </CTableDataCell>


    <CTableHeaderCell>{{ idx + 1 }}</CTableHeaderCell>
    <CTableDataCell>{{ student.user.full_name }}</CTableDataCell>
    <CTableDataCell>{{ student.current_class }}</CTableDataCell>
    <CTableDataCell>{{ student.contact_of_father }}</CTableDataCell>
    <CTableDataCell>{{ student.contact_of_mother }}</CTableDataCell>

    <CTableDataCell>
      <CBadge :color="student.is_discounted_student ? 'success' : 'secondary'">
        {{ student.is_discounted_student ? 'Yes' : 'No' }}
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
    Are you sure you want to delete <strong>{{ studentToDelete?.full_name }}</strong>?
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" variant="outline" @click="cancelDelete">Cancel</CButton>
    <CButton color="danger" @click="confirmDelete">Delete</CButton>
  </CModalFooter>
</CModal>



  <!-- Confirm Delete (Bulk) -->
  <CModal :visible="showDeleteBulkModal" @close="closeBulkDeleteConfirm">
    <CModalHeader><CModalTitle>Delete Selected</CModalTitle></CModalHeader>
    <CModalBody>
      You are about to delete <strong>{{ selectedIds.length }}</strong> payment(s).
      This action cannot be undone. Continue?
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="closeBulkDeleteConfirm" :disabled="isDeleting">Cancel</CButton>
      <CButton color="danger" @click="confirmDeleteBulk" :disabled="isDeleting">
        <CSpinner size="sm" v-if="isDeleting" class="me-2" />Delete Selected
      </CButton>
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
              <CFormInput v-model="form.full_name" />
            </div>

            <div class="col-md-3">
              <CFormLabel>Gender</CFormLabel>
                <CFormSelect v-model="form.gender">
                <option disabled value="">Choose Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                </CFormSelect>
            </div>

           

           

            <div class="col-md-6">  
              <CFormLabel>Current Class</CFormLabel>                    
              <CFormSelect v-model="form.current_class">
                <option disabled value="" selected>Select current class</option>
                <option v-for="cls in classOptions" :key="cls.value" :value="cls.value">
                  {{ cls.label }}
                </option>
              </CFormSelect>
            </div>

     

            
          </div>
        </CTab>

        

        <CTab title="Parental Info" itemKey="Parental Info">
          <div class="row g-3">
            <div class="col-md-6">
             
              <CFormLabel>Contact of Father</CFormLabel>
              <CFormInput v-model="form.contact_of_father" />
              
            </div>
            <div class="col-md-6">
              
              
              <CFormLabel>Contact of Mother</CFormLabel>
              <CFormInput v-model="form.contact_of_mother" />
              
            </div>

            <div class="col-md-4 d-flex align-items-center mt-4">
  <CFormLabel class="me-3 mb-0">Discounted Student</CFormLabel>
  <CFormSwitch 
    color="primary"
    v-model="form.is_discounted_student"
    label="Yes"
  />
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
const students = ref([])



import { ref, computed,  onMounted } from 'vue'
import {st} from '@/services/api'
import {create_student} from '@/services/api'
import {update_student} from '@/services/api'
import {delete_student} from '@/services/api' 

const selectedIds = ref([])
const showDeleteBulkModal = ref(false)
const isDeleting = ref(false)

function openBulkDeleteConfirm() {
  showDeleteBulkModal.value = true
}
function closeBulkDeleteConfirm() {
  if (!isDeleting.value) {
    showDeleteBulkModal.value = false
  }
}


async function confirmDeleteBulk() {
  const ids = [...selectedIds.value]
  if (ids.length === 0) return

  isDeleting.value = true

  try {
    for (const id of ids) {
      await delete_student(id)
    }

    const toDelete = new Set(ids)
    students.value = students.value.filter(s => !toDelete.has(s.id))

    selectedIds.value = []
    showDeleteBulkModal.value = false

    toast.success('Selected students deleted successfully!')
  } catch (error) {
    console.error(error)
    toast.error('Failed to delete selected students.')
  } finally {
    isDeleting.value = false
  }
}


async function fetchUsers() {
  loading.value = true

  try {
    const response = await st();
    console.log("Fetched students:print", response.data);




    students.value = response.data;
    
    
    
  }  catch (err) {


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





const classOptions = [
  { label: 'Creche', value: 1 },

  { label: 'Nursery 1A', value: 2 },
  { label: 'Nursery 1B', value: 3 },

  { label: 'Nursery 2A', value: 4 },
  { label: 'Nursery 2B', value: 5 },

  { label: 'KG 1A', value: 6 },
  { label: 'KG 1B', value: 7 },

  { label: 'KG 2A', value: 8 },
  { label: 'KG 2B', value: 9 },

  { label: 'Basic 1A', value: 10 },
  { label: 'Basic 1B', value: 11 },

  { label: 'Basic 2A', value: 12 },
  { label: 'Basic 2B', value: 13 },

  { label: 'Basic 3A', value: 14 },
  { label: 'Basic 3B', value: 15 },

  { label: 'Basic 4A', value: 16 },
  { label: 'Basic 4B', value: 17 },

  { label: 'Basic 5A', value: 18 },
  { label: 'Basic 5B', value: 19 },

  { label: 'Basic 6A', value: 20 },
  { label: 'Basic 6B', value: 21 },

  { label: 'Basic 7A', value: 22 },
  { label: 'Basic 7B', value: 23 },

  { label: 'Basic 8', value: 24 },
  { label: 'Basic 9', value: 25 },
]



const searchTerm = ref('')
const showFormModal = ref(false)
const isEdit = ref(false)
const currentStudent = ref(null)




const form = ref({
  // nested user object used throughout the modal
  
    full_name: '',
    gender: '',            // 'male' | 'female'
    nationality: '',
    date_of_birth: '',     // 'YYYY-MM-DD' string for <input type="date"> 

  // class selections (strings to satisfy CFormSelect)
  current_class: '',            // e.g., 'jhs 1'
  classSeekingAdmissionTo: '', // e.g., 'jhs 1'

  // other top-level fields
  familyId: '',
  is_discounted_student: false,
  immunized: false,
  allergies: false,
  allergic_foods: '',
  hasPeculiarHealthIssues: false,
  health_issues: '',
  name_of_father: '',
  occupation_of_father: '',
  contact_of_father: '',
  nationality_of_father: '',
  name_of_mother: '',
  occupation_of_mother: '',
  contact_of_mother: '',
  nationality_of_mother: '',
  lastSchoolAttended: '',
  houseNumber: '',
  otherRelatedInfo: '',
  active: true,

  // this looks like a boolean UI flag in your code; rename to avoid confusion with backend staff ID
  staff: false,

  role: 'STUDENT',
});


/*all refs above*/

const filteredStudents = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return term ? students.value.filter(s => s.user.full_name.toLowerCase().includes(term)) : students.value
})
const filteredIds = computed(() => filteredStudents.value.map(s => s.id))

const allSelected = computed(() =>
  filteredIds.value.length > 0 && filteredIds.value.every(id => selectedIds.value.includes(id))
)

const someSelected = computed(() =>
  filteredIds.value.length > 0 &&
  !allSelected.value &&
  filteredIds.value.some(id => selectedIds.value.includes(id))
)

function toggleSelectAll() {
  if (allSelected.value) {
    // unselect all visible
    selectedIds.value = selectedIds.value.filter(id => !filteredIds.value.includes(id))
  } else {
    // select all visible
    selectedIds.value = [...new Set([...selectedIds.value, ...filteredIds.value])]
  }
}

const openAddModal = () => {
  isEdit.value = false
  currentStudent.value = null
  form.value = { ...form.value, full_name: '', is_discounted_student:false, contact_of_mother:'', contact_of_father:'', gender: '', nationality: '', date_of_birth: '', current_class: '', familyId: '' }
  showFormModal.value = true
}

const openEditModal = (student) => {


  isEdit.value = true;
  currentStudent.value = student;

  form.value = {
    full_name: student.user.full_name || '',
    gender: student.user.gender || '',
    nationality: student.user.nationality || '',
    date_of_birth: student.user.date_of_birth || '',

    current_class: student.current_class || '',
    classSeekingAdmissionTo: student.class_seeking_admission_to || '',

    familyId: '',

    immunized: student.is_immunized === 'yes',
    allergies: student.has_allergies === 'yes',
    allergic_foods: student.allergic_foods || '',
    hasPeculiarHealthIssues: student.has_peculiar_health_issues === 'yes',
    health_issues: student.health_issues || '',

    name_of_father: student.name_of_father || '',
    occupation_of_father: student.occupation_of_father || '',
    contact_of_father: student.contact_of_father || '',
    nationality_of_father: student.nationality_of_father || '',

    name_of_mother: student.name_of_mother || '',
    occupation_of_mother: student.occupation_of_mother || '',
    contact_of_mother: student.contact_of_mother || '',
    nationality_of_mother: student.nationality_of_mother || '',

    lastSchoolAttended: student.last_school_attended || '',
    houseNumber: student.house_number || '',
    otherRelatedInfo: student.other_related_info || '',

    active: student.user.is_active,

    staff: false,
    role: student.user.role?.toUpperCase() || 'STUDENT',
  };

  // Fix class dropdown value
  if (typeof student.current_class === 'string') {
    const classOption = classOptions.find(
      opt => opt.label.toLowerCase() === student.current_class.toLowerCase()
    );
    form.value.current_class = classOption ? classOption.value : '';
  }

  showFormModal.value = true;
};



const closeFormModal = () => {
  showFormModal.value = false
  currentStudent.value = null
}



const prepareStudentPayload = (payload) => {
  return {
    user: {
      full_name: payload.full_name,
      role: "student",
      gender: payload.gender,
      nationality: payload.nationality,
      is_active: true,
      is_staff: false,
      date_of_birth: payload.date_of_birth
    },
    current_class: payload.current_class,
    house_number: payload.houseNumber,
    is_discounted_student: payload.is_discounted_student,
    
    last_school_attended: payload.lastSchoolAttended,
    class_seeking_admission_to: payload.class_seeking_admission_to,
    is_immunized: payload.immunized ? "yes" : "no",
    has_allergies: payload.allergies ? "yes" : "no",

    allergic_foods: payload.allergic_foods,

    hasPeculiarHealthIssues: payload.hasPeculiarHealthIssues ? "yes" : "no",

    contact_of_father: payload.contact_of_father,
    contact_of_mother: payload.contact_of_mother,
    occupation_of_father: payload.occupation_of_father,
    occupation_of_mother: payload.occupation_of_mother,

    name_of_father: payload.name_of_father,
    name_of_mother: payload.name_of_mother,

    nationality_of_father: payload.nationalityOfFather,
    nationality_of_mother: payload.nationalityOfMother,

    
    peculiar_health_issues: payload.healthIssues,
    other_related_info: payload.otherRelatedInfo
  };
};


function formatBackendErrors(errData) {
  if (!errData) return null;

  const parts = [];

  function walk(obj, prefix = "") {
    if (Array.isArray(obj)) {
      // leaf: array of messages
      const msgs = obj.map(m => String(m)).join("; ");
      parts.push(`${prefix}: ${msgs}`);
      return;
    }

    if (typeof obj === "string") {
      parts.push(`${prefix}: ${obj}`);
      return;
    }

    if (obj && typeof obj === "object") {
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        const nextPrefix = prefix ? `${prefix}.${key}` : key;
        walk(value, nextPrefix);
      }
      return;
    }

    // other types
    parts.push(`${prefix}: ${String(obj)}`);
  }

  // If the server returned an array at the root, show those.
  if (Array.isArray(errData)) {
    return errData.map(x => String(x)).join(" / ");
  }

  // walk object
  walk(errData);

  // produce a single string
  return parts.length ? parts.join(" | ") : null;
}


const submitForm = async () => {
  loading.value = true;

  try {


    // ✅ Apply defaults BEFORE validation
    form.value.gender = form.value.gender || 'male';
    form.value.current_class = form.value.current_class || 'creche';
    form.value.nationality = form.value.nationality || 'Ghanaian';
    form.value.date_of_birth = form.value.date_of_birth || '2002-02-02';

    // ✅ Required field validation
    

    // ✅ Clean up form: trim strings and convert empty strings to null
    function deepClean(obj) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
          if (typeof value === "string") {
            const trimmed = value.trim();
            return [key, trimmed === "" ? null : trimmed];
          } else if (value && typeof value === "object") {
            return [key, deepClean(value)];
          }
          return [key, value];
        })
      );
    }

    const cleaned = deepClean(form.value);


      if (isEdit.value && currentStudent.value) {
      // ✅ Update existing student
      const payload = prepareStudentPayload(cleaned);
      const response = await update_student(currentStudent.value.id, payload);



      // Update table immediately
      const index = students.value.findIndex(s => s.id === currentStudent.value.id);
      if (index !== -1) {
        students.value[index] = { ...response.data };
      }

      closeFormModal();

      toast.success('Student updated successfully!', { position: 'top-right' });
      } else {
    // ✅ Call API and wait for response

    const payload = prepareStudentPayload(cleaned);



    const requiredFields = [
      { field: 'full_name', label: 'Full Name' },
      { field: 'contact_of_father', label: 'Contact of Father' },
      { field: 'contact_of_mother', label: 'Contact of Mother' },
    ];

    for (const { field, label } of requiredFields) {
      if (!form.value[field] || form.value[field].toString().trim() === '') {
        toast.error(`${label} is required`, { position: 'top-right' });
        loading.value = false;
        return;
      }
    }
    console.log("payload to send", payload);
    const response = await create_student(payload);


  

    if (response && response.data) {
    

      // ✅ Update the table immediately with the new student record
  
      students.value.push(response.data);

      toast.success('Student created successfully!', { position: 'top-right' });

      // ✅ Close modal after success
      closeFormModal();

      // ✅ OPTIONAL: Delay navigation slightly to ensure UI update
      setTimeout(() => {
        router.push({ path: '/administrator/student' });
      }, 500);
    } else {
      throw new Error('No response data from the server.');
    }}

  } catch (err) {
   
    console.log("the error", err);

  const serverData = err?.e?.response

;
  const formatted = formatBackendErrors(serverData);

  const message = formatted || err?.message || "Failed to create student. Please check your input and try again.";
  // show first line only in the toast if you want brevity:
  const firstLine = message.split(" | ")[0];

  toast.error(firstLine, { position: "top-right" });
  // optionally show full errors in console or another UI element

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

  // Store id and name locally to use after delete
  const studentId = studentToDelete.value.id
  const studentName = studentToDelete.value.user.full_name

  try {
    await delete_student(studentId)
    
    // Remove student from local state
    students.value = students.value.filter(s => s.id !== studentId)
    
    toast.success(`${studentName} deleted successfully!`, { position: 'top-right' })
  } catch (error) {
    console.error('Delete error:', error)
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


