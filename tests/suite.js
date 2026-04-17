const results = document.getElementById('test-results');

function runTest(name, testFunc) {
  try {
    const res = testFunc();
    if (res === true) {
      logResult(name, true, "Passed");
    } else {
      logResult(name, false, "Failed");
    }
  } catch (error) {
    logResult(name, false, error.message);
  }
}

function logResult(name, isPass, msg) {
  const li = document.createElement('li');
  li.className = isPass ? 'pass' : 'fail';
  li.textContent = `[${isPass ? 'OK' : 'ERR'}] ${name}: ${msg}`;
  results.appendChild(li);
}

// Ensure mockData loaded
runTest("Mock DB Array Validation", () => {
  if (!window.mockData) throw new Error("mockData missing");
  if (!Array.isArray(window.mockData.facilities)) throw new Error("Facilities is not array");
  return window.mockData.facilities.length > 5;
});

// Test wait time bounds
runTest("Identify Nearest Lowest Wait Time Constraint", () => {
  const d = window.mockData;
  const foods = d.facilities.filter(f => f.type === 'food');
  foods.sort((a,b) => a.waitTime - b.waitTime);
  return foods[0].waitTime <= 10;
});

// Test VIP constraints (now defined by Ticket Contexts)
runTest("VIP User Validation", () => {
  const vipTicket = window.mockData.tickets['VIP-AA123'];
  return vipTicket && vipTicket.role === 'vip' && vipTicket.seat !== undefined;
});

runTest("Verify Zone IDs", () => {
    return !!window.mockData.zones['north'] && !!window.mockData.zones['south'];
});
