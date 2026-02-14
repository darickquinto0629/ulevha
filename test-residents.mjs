const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcwOTk5ODc5LCJleHAiOjE3NzEwODYyNzl9.ioGQ55z2iIXm5CkYB35k80GO9WkLBFjjJK-mgGQ-tFw';

const body = {
  household_number: 'HH-TEST-' + Date.now(),
  first_name: 'John',
  last_name: 'Doe',
  gender: 'M',
  date_of_birth: '1990-05-15',
  address: 'Test Address'
};

console.log('📤 Request Body:', JSON.stringify(body, null, 2));

const response = await fetch('http://localhost:3000/api/residents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify(body)
});

const data = await response.json();
console.log('\n📥 Response Status:', response.status);
console.log('📥 Response Body:', JSON.stringify(data, null, 2));
