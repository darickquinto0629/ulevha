const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcwOTk5ODc5LCJleHAiOjE3NzEwODYyNzl9.ioGQ55z2iIXm5CkYB35k80GO9WkLBFjjJK-mgGQ-tFw';

const createResident = async (firstName, lastName) => {
  const body = {
    household_number: 'HH-TEST-' + Date.now() + Math.random(),
    first_name: firstName,
    last_name: lastName,
    gender: 'F',
    date_of_birth: '1995-08-20',
    address: 'Test Address 123'
  };

  const r = await fetch('http://localhost:3000/api/residents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body)
  });
  
  const data = await r.json();
  console.log(`[SUCCESS] Created: ${data.data.resident_id} - ${firstName} ${lastName}`);
};

console.log('Creating test residents...\n');
await createResident('Jane', 'Smith');
await createResident('Maria', 'Garcia');
await createResident('Sarah', 'Johnson');
console.log('\nAll residents created successfully!');
