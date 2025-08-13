(setup());

function setup() {
  // Add initial row to the form.
  addRow();
  addRow();
  addRow();
  addRow();
  addRow();
  addRow();
  addRow();

  // Add listener to Add Course button
  document.getElementById('add-course').addEventListener(
    'click',
    function(e) {
      addRow();
      e.preventDefault();
      e.stopPropagation();
    },
    false
  );

  // Add listener to Reset button
  document.getElementById('reset').addEventListener(
    'click',
    clearResults,
    false
  );

  // Add listener to Remove Course button
  document.getElementById('input-form').addEventListener(
    'click',
    function(e) {
      if (e.target.classList.contains('remove-course')) {
        const row = e.target.closest('tr');
        if (row) {
          row.remove();
        }
        e.preventDefault();
        e.stopPropagation();
      }
    }
  );

  // Add listener to Submit button
  document.getElementById('input-form').addEventListener(
    'submit',
    submitForm,
    false
  );
};

const getValueFromLetterGrade = (letterGrade) => {
  switch (letterGrade) {
    case 'A':
      return 4.0;
    case 'B':
      return 3.0;
    case 'C':
      return 2.0;
    case 'D':
      return 1.0;
    case 'F':
      return 0.0;
    default:
      throw new Error(`Unknown letter grade: ${letterGrade}`);
  }
};

const rowToData = (row) => ({
  course: row.querySelector('.course').value,
  credits: parseFloat(row.querySelector('.credits').value),
  gradeValue: getValueFromLetterGrade(
    row.querySelector('.grade').value
  ),
  type: row.querySelector('.type').value,
});

const getUnweightedGPA = (rows) => {
  let totalCredits = 0;
  let totalGradePoints = 0;
  rows.forEach(({gradeValue, credits}) => {
    totalGradePoints += gradeValue * credits;
    totalCredits += credits;
  });
  return totalCredits === 0 ? 0 : totalGradePoints / totalCredits;
};

const getGradeLevelModifier = () => {
  return parseInt(document.getElementById('grade-level').value, 10);;
};

const getWeightedBump = (rows, gradeLevelModifier) => {
  const bump = rows.reduce((acc, {type, gradeValue}) => {
    if (type === 'ap' && gradeValue >= 2.0) {
      return acc + 0.25;
    }
    if (type === 'honors' && gradeValue >= 3.0) {
      return acc + 0.20;
    }
    return acc;
  }, 0);
  return bump / gradeLevelModifier;
};

function submitForm(e) {
  const rows = Array.from(
    document.querySelectorAll('#input-form tbody tr')
  ).map(rowToData);;
  const unweightedGPA = getUnweightedGPA(rows);
  const weightedBump = getWeightedBump(rows, getGradeLevelModifier());
  outputResults(unweightedGPA, weightedBump);
  e.preventDefault();
  e.stopPropagation();
}

function clearResults() {
  const output = document.getElementById('output');
  output.innerHTML = '';
}

function outputResults(unweightedGPA, weightedBump) {
  const output = document.getElementById('output');
  output.innerHTML = `
    <h2>Results</h2>
    <p>Unweighted GPA: ${unweightedGPA.toFixed(4)}</p>
    <p>Weighted Bump: ${weightedBump.toFixed(4)}</p>
    <p>Weighted GPA: ${(unweightedGPA + weightedBump).toFixed(4)}</p>
  `;
}

function addRow() {
  const templateRow = document.querySelector('#template tr');
  const inputFormTableBody = document.querySelector('#input-form table tbody');
  inputFormTableBody.appendChild(
    templateRow.cloneNode(true)
  );
}
