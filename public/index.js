let html = {val: ''};

function loadTree() {
  fetch('/companies')
    .then(response => response.json())
    .then(tree => {
      renderTree(tree);
    });
}

function renderTree(tree) {
  html.val = '';
  searchTree(tree);

  document.querySelector('#companies').innerHTML = html.val;
}

function searchTree(companies) {
  html.val += '<ul>';
  for (let company of companies) {
    html.val += `<li>
      ${company.name} / ${company.earn}K$ / ${company.total}K$
      <a href="#" onclick="formCreateChild('${company._id}')">New child</a>
      <a href="#" onclick="handleDelete('${company._id}')">Delete</a>
      <a href="#" onclick="viewCompany('${company._id}')">View</a>
      <a href="#" onclick="formEditCompany('${company._id}')">Edit</a>
    </li>`
    if (Array.isArray(company.children)) {
      searchTree(company.children);
    }
  }
  html.val += '</ul>';
}

function createCompany(company) {
  return fetch('/companies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(company)
  });
}

function handleCreate() {
  const form = document.querySelector('form');
  form.addEventListener('submit', function(e) {
    const name = form.querySelector('[name=name]').value;
    const earn = form.querySelector('[name=earn]').value;
    const parent = '';
    const company = { name, earn, parent };

    createCompany(company)
      .then(loadTree());

    e.preventDefault();
    e.stopPropagation();
  });
}

function formCreateChild(id) {
  let form = `
  <form id="new_child">
    Name: <input type="text" name="name"><br>
    Earn: <input type="text" name="earn"><br>
    <input type="hidden" name="id" value="${id}">
    <input type="submit" value="New child" onclick="createChild()">
  </form>`;
  document.querySelector('#companies').innerHTML = form;
}

function formEditCompany(id) {
  let form = `
  <form id="edit">
    Name: <input type="text" name="name"><br>
    Earn: <input type="text" name="earn"><br>
    <input type="hidden" name="id" value="${id}">
    <input type="submit" value="Save" onclick="handleEditCompany()">
  </form>`;
  document.querySelector('#companies').innerHTML = form;
}

function createChild() {
  const form = document.querySelector('#new_child');

  form.addEventListener('submit', function(e) {
    const name = form.querySelector('[name=name]').value;
    const earn = form.querySelector('[name=earn]').value;
    const parent = form.querySelector('[name=id]').value;
    const company = { name, earn, parent };

    createCompany(company)
      .then(loadTree());

    e.preventDefault();
    e.stopPropaga
  });
}

function handleEditCompany() {
  const form = document.querySelector('#edit');

  form.addEventListener('submit', function(e) {
    const name = form.querySelector('[name=name]').value;
    const earn = form.querySelector('[name=earn]').value;
    const id = form.querySelector('[name=id]').value;
    const company = { id, name, earn };

    editCompany(company)
      .then(loadTree());

    e.preventDefault();
    e.stopPropaga
  });
}

function editCompany(company) {
  return fetch(`/companies/edit/${company.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(company)
  });
}

function deleteCompany(id){
  return fetch(`/companies/delete/${id}`, {
    method: 'DELETE'
  });
}

function handleDelete(id) {
  deleteCompany(id)
    .then(loadTree());
}

function viewCompany(id) {
  let text = '';

  fetch(`/companies/${id}`)
    .then(response => response.json())
    .then(company => {

      text += `Name: ${company.name} Earn: ${company.earn} <br>
      <button onclick="loadTree()">To tree</button>`;
      document.querySelector('#companies').innerHTML = text;
    });
}

loadTree();
handleCreate();
