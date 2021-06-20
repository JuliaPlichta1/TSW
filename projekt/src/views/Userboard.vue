<template>
  <div class="container mt-2 px-5">
    <Popup id="passwordChangeModal" :icon="popup.icon" :headerText="popup.headerText">
      <template v-slot:body>
        {{ popup.body }}
      </template>
    </Popup>
    <h2>Profile</h2>
    <div></div>
    <p class="mb-1">
      <span class="fw-bold">Email: </span>{{ user.email }}
    </p>
    <p>
      <span class="fw-bold">Nickname: </span>{{ user.nickname }}
    </p>
    <button class="btn btn-primary mb-3 px-3" @click="toggleForm">Change password</button>
    <div class="d-flex justify-content-center" v-if="showForm">
      <div style="width: 40rem">
        <div class="list-group-item">
          <form @submit="submit" class="needs-validation" novalidate>
            <div class="form-floating mb-3 mt-2">
              <input type="password" class="form-control" id="old-password" v-model="oldPassword" @change="removeFeedback" placeholder="Current password" required>
              <label for="old-password">Current password</label>
              <div class="invalid-feedback" id="invalid-old-password">
                Incorrect password.
              </div>
            </div>
            <div class="form-floating mb-3">
              <input type="password" class="form-control" id="new-password" v-model="newPassword" @change="checkPasswords" placeholder="New password" required>
              <label for="new-password">New password</label>
            </div>
            <div class="form-floating mb-3">
              <input type="password" class="form-control" id="new-password-confirm" v-model="newPasswordConfirm" @change="checkPasswords" placeholder="Confirm new password" required>
              <label for="new-password-confirm">Confirm new password</label>
              <div class="invalid-feedback" id="invalid-new-passwords">
                Please confirm password.
              </div>
            </div>
            <button type="submit" class="btn btn-primary px-4">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Modal } from 'bootstrap';
import Popup from '../components/Popup.vue';
import axios from 'axios';

export default {
  name: 'Userboard',
  components: { Popup },
  data() {
    return {
      showForm: false,
      oldPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      popup: {
        icon: '',
        headerText: '',
        body: ''
      }
    };
  },
  computed: {
    ...mapGetters(['user'])
  },
  methods: {
    toggleForm() {
      this.showForm = !this.showForm;
    },
    submit(event) {
      event.preventDefault();
      const vm = this;
      vm.checkPasswords();

      const form = document.querySelector('.needs-validation');
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        vm.changePassword(vm.oldPassword, vm.newPassword, vm.newPasswordConfirm);
      }
      form.classList.add('was-validated');
    },
    removeFeedback() {
      const passwordElement = document.getElementById('old-password');
      passwordElement.classList.remove('is-invalid');
      passwordElement.setCustomValidity('');
    },
    checkPasswords() {
      const vm = this;
      const confirmPasswordElement = document.getElementById('new-password-confirm');
      if (vm.newPassword !== vm.newPasswordConfirm) {
        confirmPasswordElement.classList.add('is-invalid');
        confirmPasswordElement.setCustomValidity('Passwords must match.');
        document.getElementById('invalid-new-passwords').innerHTML = confirmPasswordElement.validationMessage;
      } else {
        confirmPasswordElement.classList.remove('is-invalid');
        confirmPasswordElement.setCustomValidity('');
      }
    },
    changePassword(oldPassword, newPassword, newPasswordConfirm) {
      const vm = this;
      axios.patch('/api/user/changePassword', { oldPassword, newPassword, newPasswordConfirm })
        .then((_response) => {
          vm.resetForm();
          const passwordChangeModal = new Modal(document.getElementById('passwordChangeModal'));
          vm.popup.icon = 'success';
          vm.popup.headerText = 'Congratulations!';
          vm.popup.body = 'Your password has been succesfully updated.';
          passwordChangeModal.show();
        })
        .catch((error) => {
          if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            if (error.response.status === 400) {
              const passwordElement = document.getElementById('old-password');
              passwordElement.classList.add('is-invalid');
              passwordElement.setCustomValidity('Incorrect password.');
              document.getElementById('invalid-old-password').innerHTML = passwordElement.validationMessage;
            }
            if (error.response.status === 500) {
              vm.handleError('Internal server error.');
            }
          } else if (error.request) {
            vm.handleError('No response received fom server.');
          } else {
            vm.handleError(`Error: ${error.message}`);
          }
        });
    },
    resetForm() {
      const form = document.querySelector('.needs-validation');
      form.classList.remove('was-validated');
      this.oldPassword = '';
      this.newPassword = '';
      this.newPasswordConfirm = '';
      this.showForm = false;
    },
    handleError(failureMsg) {
      const vm = this;
      vm.popup.icon = 'danger';
      vm.popup.headerText = 'Error!';
      vm.popup.body = failureMsg;
      const passwordChangeModal = new Modal(document.getElementById('passwordChangeModal'));
      passwordChangeModal.show();
    }
  },
};
</script>
