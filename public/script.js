const form = document.querySelector('form#exercise-form');

form.addEventListener('submit', () => {
  const uid = document.querySelector('#uid').value.trim();
  form.action = `/api/users/${uid}/exercises`;
  exerciseForm.submit();
});
