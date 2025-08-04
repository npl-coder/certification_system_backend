// Test integer validation logic
function testIntegerValidation() {
  console.log('=== Testing Integer Validation Logic ===\n');
  
  const testCases = [
    { input: '1', expected: 'valid' },
    { input: '123', expected: 'valid' },
    { input: '0', expected: 'invalid - zero' },
    { input: '-1', expected: 'invalid - negative' },
    { input: 'abc', expected: 'invalid - string' },
    { input: '1.5', expected: 'valid - truncated to 1' },
    { input: '', expected: 'invalid - empty' },
    { input: null, expected: 'invalid - null' },
    { input: undefined, expected: 'invalid - undefined' },
    { input: '999999', expected: 'valid' }
  ];
  
  testCases.forEach(testCase => {
    console.log(`Input: ${JSON.stringify(testCase.input)}`);
    console.log(`Expected: ${testCase.expected}`);
    
    // Simulate the validation logic from the controller
    if (!testCase.input) {
      console.log('Result: ❌ Missing eventId\n');
      return;
    }
    
    const eventIdInt = parseInt(testCase.input, 10);
    if (isNaN(eventIdInt) || eventIdInt <= 0) {
      console.log(`Result: ❌ Invalid integer (parsed as: ${eventIdInt})\n`);
      return;
    }
    
    console.log(`Result: ✅ Valid integer (${eventIdInt})\n`);
  });
}

// Run the test
if (require.main === module) {
  testIntegerValidation();
}

module.exports = { testIntegerValidation };
