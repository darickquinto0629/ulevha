const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcwOTk5ODc5LCJleHAiOjE3NzEwODYyNzl9.ioGQ55z2iIXm5CkYB35k80GO9WkLBFjjJK-mgGQ-tFw';

console.log('Fetching all residents...\n');

const r = await fetch('http://localhost:3000/api/residents', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const data = await r.json();

console.log(`Total Residents: ${data.pagination.total}`);
console.log(`Pagination: Page ${data.pagination.page} of ${data.pagination.pages}\n`);

console.log('Resident List:');
console.log('========================');
if (data.data.length > 0) {
  data.data.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.resident_id}] ${r.first_name} ${r.last_name} (${r.gender}, Age: ${r.age})`);
  });
} else {
  console.log('No residents found');
}

console.log('========================');
